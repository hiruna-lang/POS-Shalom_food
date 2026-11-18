import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/utils/billing.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { calculateBill, isPaidSale } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('portion prices, quantities, and both dine-in charges reconcile to the cent', () => {
  const bill = calculateBill([{ price: 1500.5, quantity: 2 }, { price: 623.55, quantity: 1 }], 10, 'percentage', 2.5, 10);
  assert.deepEqual(bill, {
    subtotal: 3624.55,
    discountAmount: 362.46,
    taxAmount: 81.55,
    serviceChargeAmount: 326.21,
    grandTotal: 3669.85,
  });
});

test('takeaway omits service charge and discounts never exceed the subtotal', () => {
  const lines = [{ price: 0.1, quantity: 3 }];
  assert.equal(calculateBill(lines, 0, 'fixed', 2.5, 0).grandTotal, 0.31);
  assert.equal(calculateBill(lines, 100, 'fixed', 2.5, 0).grandTotal, 0);
  assert.equal(calculateBill(lines, 200, 'percentage', 2.5, 0).grandTotal, 0);
});

test('sales include a paid kitchen order and exclude pending payments and voids', () => {
  assert.ok(isPaidSale({ paymentStatus: 'paid', orderStatus: 'in_kitchen' }));
  assert.ok(!isPaidSale({ paymentStatus: 'pending', orderStatus: 'completed' }));
  assert.ok(!isPaidSale({ paymentStatus: 'paid', orderStatus: 'cancelled' }));
});
