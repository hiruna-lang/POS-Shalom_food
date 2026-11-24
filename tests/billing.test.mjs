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

// Render the actual printable components without opening a printer dialog.
const toDataUrl = (text) => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const transpile = (text) => ts.transpileModule(text, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const receiptCode = transpile(await readFile(new URL('../src/utils/receipt.ts', import.meta.url),'utf8'));
const receiptUrl = toDataUrl(receiptCode);
const {kitchenTickets,orderToken,receiptTime} = await import(receiptUrl);
const documentCode = transpile(await readFile(new URL('../src/components/pos/OrderDocuments.tsx',import.meta.url),'utf8'))
 .replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve('react/jsx-runtime')))
 .replaceAll("'react'", JSON.stringify(import.meta.resolve('react')))
 .replaceAll("'../../utils/receipt'", JSON.stringify(receiptUrl));
const {CustomerReceipt,KitchenReceipts} = await import(toDataUrl(documentCode));
const {createElement} = await import('react');
const {renderToStaticMarkup} = await import('react-dom/server');
const fixtures = await import(toDataUrl(transpile(await readFile(new URL('../src/data/mockData.ts', import.meta.url),'utf8'))));
const settings = fixtures.INITIAL_SETTINGS;
const receiptOrder = {...fixtures.INITIAL_ORDERS[0], orderNumber:'SF-5305',createdAt:'2026-11-23T10:30:00Z',customerName:'Walk-In',cashierName:'Cashier',paymentStatus:'pending',
 items:[{menuItem:{id:'food',name:'Extra Long Chicken String Hopper Biryani With Vegetables',categoryId:'test',price:650,kitchen:'kitchen_1'},portion:'Full',quantity:2,notes:'Less spicy <script>alert(1)</script>'}],
 subtotal:1300,discount:0,tax:0,serviceCharge:0,total:1300};
test('receipt has reference columns, unpaid state and untruncated escaped item details',()=>{
 const html=renderToStaticMarkup(createElement(CustomerReceipt,{order:receiptOrder,settings}));
 for(const text of ['ITEM','QTY','PRICE','AMOUNT','NOT PAID','1,300.00','Full portion','Extra Long Chicken String Hopper Biryani With Vegetables','5305'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('409188200'));
 assert.ok(!html.includes('Kollupitiya Main Flagship'));
 assert.ok(html.includes('/shalom-receipt-mark.svg'));
 assert.ok(html.includes('Gothatuwa New Town Junction, Sri Lanka'));
});
test('paid receipt preserves zero paid/change instead of replacing it with total',()=>{
 const html=renderToStaticMarkup(createElement(CustomerReceipt,{order:{...receiptOrder,paymentStatus:'paid',paymentMethod:'cash',amountPaid:0,changeDue:0},settings}));
 assert.ok(!html.includes('NOT PAID'));
 assert.match(html,/Amount Tendered:<\/span><strong>0.00/);
 assert.match(html,/Change:<\/span><strong>0.00/);
});
test('KOT routes by item override then category then menu, omits prices and empty kitchens',()=>{
 const order={...receiptOrder,items:[{...receiptOrder.items[0],kitchenTarget:'kitchen_2'}]};
 const tickets=kitchenTickets(order,{...settings,kitchenRouting:{test:'kitchen_1'}});
 assert.equal(tickets.length,1);assert.equal(tickets[0].target,'kitchen_2');
 const html=renderToStaticMarkup(createElement(KitchenReceipts,{order,settings,reprint:true}));
 for(const text of ['KITCHEN 2','REPRINT / FULL ORDER','2x','Full Portion','Less spicy','END OF KOT'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('KITCHEN 1'));assert.ok(!html.includes('650.00'));assert.ok(!html.includes('192.168'));
 assert.equal(kitchenTickets({...order,items:[]},settings).length,0);
 assert.equal(kitchenTickets(receiptOrder,{...settings,kitchenRouting:{test:'kitchen_2'}})[0].target,'kitchen_2');
});
test('order token and Sri Lanka receipt time remain deterministic',()=>{
 assert.equal(orderToken('SF-5305'),'5305');
 assert.equal(orderToken('CUSTOM-ID'),'CUSTOM-ID');
 assert.ok(receiptTime('2026-11-23T10:30:00Z').includes('16:00:00'));
});
