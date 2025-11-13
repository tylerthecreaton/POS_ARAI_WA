<?php

namespace App\Http\Controllers;

use App\Models\StockTransaction;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class StockTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockTransaction::with('ingredient');

        // Filter by ingredient
        if ($request->has('ingredient_id')) {
            $query->where('ingredient_id', $request->ingredient_id);
        }

        // Filter by transaction type
        if ($request->has('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'transaction_type' => ['required', Rule::in(['in', 'out', 'adjustment'])],
            'quantity' => 'required|numeric|min:0.01',
            'unit_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $ingredient = Ingredient::findOrFail($validated['ingredient_id']);

        // Create stock transaction
        $transaction = StockTransaction::create($validated);

        // Update ingredient stock based on transaction type
        if ($validated['transaction_type'] === 'in') {
            $ingredient->current_stock += $validated['quantity'];
        } elseif ($validated['transaction_type'] === 'out') {
            if ($ingredient->current_stock < $validated['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock'
                ], 400);
            }
            $ingredient->current_stock -= $validated['quantity'];
        } elseif ($validated['transaction_type'] === 'adjustment') {
            // For adjustment, set the stock directly to the quantity
            $ingredient->current_stock = $validated['quantity'];
        }

        $ingredient->save();

        // Load ingredient relationship for response
        $transaction->load('ingredient');

        return response()->json([
            'success' => true,
            'data' => $transaction,
            'message' => 'Stock transaction created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $transaction = StockTransaction::with('ingredient')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $transaction = StockTransaction::findOrFail($id);

        $validated = $request->validate([
            'transaction_type' => ['sometimes', Rule::in(['in', 'out', 'adjustment'])],
            'quantity' => 'sometimes|numeric|min:0.01',
            'unit_cost' => 'sometimes|nullable|numeric|min:0',
            'notes' => 'sometimes|nullable|string',
        ]);

        $transaction->update($validated);

        return response()->json([
            'success' => true,
            'data' => $transaction,
            'message' => 'Stock transaction updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $transaction = StockTransaction::findOrFail($id);

        // Reverse the stock change
        $ingredient = $transaction->ingredient;

        if ($transaction->transaction_type === 'in') {
            $ingredient->current_stock -= $transaction->quantity;
        } elseif ($transaction->transaction_type === 'out') {
            $ingredient->current_stock += $transaction->quantity;
        }
        // For adjustment, we can't reliably reverse it, so we won't change the stock

        $ingredient->save();
        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Stock transaction deleted successfully'
        ]);
    }

    /**
     * Get stock summary for all ingredients.
     */
    public function summary(): JsonResponse
    {
        $ingredients = Ingredient::with('stockTransactions')->get();

        $summary = $ingredients->map(function ($ingredient) {
            $lastTransaction = $ingredient->stockTransactions->first();

            return [
                'id' => $ingredient->id,
                'name' => $ingredient->name,
                'unit' => $ingredient->unit,
                'current_stock' => $ingredient->current_stock,
                'min_stock' => $ingredient->min_stock,
                'cost_per_unit' => $ingredient->cost_per_unit,
                'is_low_stock' => $ingredient->current_stock <= $ingredient->min_stock,
                'last_transaction' => $lastTransaction ? [
                    'date' => $lastTransaction->created_at,
                    'type' => $lastTransaction->transaction_type,
                    'quantity' => $lastTransaction->quantity,
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }
}
