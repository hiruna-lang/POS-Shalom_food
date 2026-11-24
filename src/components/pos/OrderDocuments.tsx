import { useState } from 'react';
import { AppSettings, Order } from '../../types/pos';
import { kitchenTickets, orderToken, orderTypeLabel, receiptAmount as amount, receiptTime } from '../../utils/receipt';

export function ReceiptBrand({general}:{general:AppSettings['general']}) {
 const [failed,setFailed]=useState(false);
 // Do not print the prototype's fictitious contact details as real business information.
 const branch = general.branchName === 'Kollupitiya Main Flagship' ? '' : general.branchName;
 const address = !general.address?.trim() || general.address === 'No. 320, Galle Road, Kollupitiya, Colombo 03, Sri Lanka' ? 'Gothatuwa New Town Junction, Sri Lanka' : general.address;
 const phone = general.phone === '+94 11 257 8899 / +94 77 712 3456' ? '' : general.phone;
 const logo=general.logo && !general.logo.includes('unsplash.com') && !failed ? general.logo : '/shalom-receipt-mark.svg';
 return <header className="receipt-brand">
  <img className="receipt-brand-mark" src={logo} onError={()=>setFailed(true)} alt="" />
  <h2>{general.restaurantName}</h2>
  <div className="receipt-brand-rule"><span/> RESTAURANT <span/></div>
  {branch && <p>{branch}</p>}
  {address && <p className="receipt-address">{address}</p>}
  {phone && <p className="receipt-phone">{phone}</p>}
 </header>;
}
export function CustomerReceipt({order,settings}:{order:Order;settings:AppSettings}) {
 const paid=order.paymentStatus==='paid',cancelled=order.orderStatus==='cancelled';
 return <article className="receipt-document customer-receipt">
  <ReceiptBrand general={settings.general}/>
  <div className="receipt-order-number">{orderToken(order.orderNumber)}</div>
  <div className="receipt-meta">
   <div><span>RECEIPT: <b>{order.orderNumber}</b></span><span>{receiptTime(order.createdAt)}</span></div>
   <div><span>CASHIER: {order.cashierName}</span><span>CUSTOMER: {order.customerName||'Walk-In'}</span></div>
  </div>
  <div className="receipt-center"><span className="receipt-label">{orderTypeLabel(order.type)}</span></div>
  <table className="receipt-items"><colgroup><col className="receipt-item-col"/><col className="receipt-qty-col"/><col/><col/></colgroup>
   <thead><tr><th>ITEM</th><th>QTY</th><th>PRICE</th><th>AMOUNT</th></tr></thead>
   <tbody>{order.items.map((item,index)=><tr key={item.lineId||index}>
    <td>{item.menuItem.name}{item.portion&&<small>{item.portion} portion</small>}{item.notes&&<small className="receipt-item-note">Note: {item.notes}</small>}</td>
    <td>{item.quantity}</td><td>{amount(item.menuItem.price)}</td><td>{amount(Math.round(item.menuItem.price*100)*item.quantity/100)}</td>
   </tr>)}</tbody>
  </table>
  <dl className="receipt-totals">
   <div><dt>Gross Amount:</dt><dd>{amount(order.subtotal)}</dd></div>
   <div><dt>Total Discount:</dt><dd>{amount(order.discount)}</dd></div>
   {order.tax>0&&<div><dt>Tax:</dt><dd>{amount(order.tax)}</dd></div>}
   <div><dt>Service Charge:</dt><dd>{amount(order.serviceCharge)}</dd></div>
   <div className="receipt-grand-total"><dt>Total Amount:</dt><dd><small>Rs.</small>{amount(order.total)}</dd></div>
  </dl>
  {order.tableName&&<p className="receipt-table">TABLE: {order.tableName}</p>}
  {order.notes&&<p className="receipt-order-note">ORDER NOTE: {order.notes}</p>}
  <div className="receipt-center"><span className="receipt-label">{cancelled?'CANCELLED':paid?'PAID':'NOT PAID'}</span></div>
  <section className="receipt-payment"><h3>PAYMENT DETAILS</h3>
   <div><span>Payment Method:</span><strong>{paid?(order.paymentMethod==='qr'?'LANKAQR':order.paymentMethod?.toUpperCase()||'PAID'):'NOT PAID'}</strong></div>
   {paid&&<><div><span>Amount Tendered:</span><strong>{amount(order.amountPaid??order.total)}</strong></div><div><span>Change:</span><strong>{amount(order.changeDue??0)}</strong></div></>}
  </section>
  <footer className="receipt-footer"><p>{settings.general.receiptFooter||'Thank you! Come again!'}</p><small>Powered by Shalom Food POS</small></footer>
 </article>;
}
export function KitchenReceipts({order,settings,reprint=false}:{order:Order;settings:AppSettings;reprint?:boolean}) {
 return <>{kitchenTickets(order,settings).map(ticket=><article className="receipt-document kitchen-print-ticket" key={ticket.target}>
  <header className="kot-heading"><p>*** KOT ***</p><h2>{ticket.title}</h2><strong>{reprint?'** REPRINT / FULL ORDER **':'** FULL ORDER **'}</strong></header>
  <div className="kot-meta"><div><span><b>Type:</b> {orderTypeLabel(order.type)}</span><span><b>Table:</b> {order.tableName||'N/A'}</span></div>
   <div><span><b>Customer:</b> {order.customerName||'Walk-in'}</span><span><b>Cashier:</b> {order.cashierName}</span></div>
   <p><b>Time:</b> {receiptTime(order.createdAt)}</p><small>Order: {order.orderNumber}</small>
  </div>
  <div className="receipt-order-number">{orderToken(order.orderNumber)}</div>
  <div className="kot-items">{ticket.items.map((item,index)=><div className="kot-item" key={item.lineId||index}><strong>{item.quantity}x</strong><div>{item.menuItem.name}{item.portion&&' - '+item.portion+' Portion'}{item.notes&&<p className="kot-instruction">NOTE: {item.notes}</p>}</div></div>)}</div>
  {order.notes&&<p className="kot-instruction kot-order-note"><b>ORDER INSTRUCTIONS:</b> {order.notes}</p>}
  <footer className="kot-footer">--- END OF KOT ---</footer>
 </article>)}</>;
}
export type PaperSize = 'A4'|'80mm'|'58mm';
export function PrintPaper({paper,setPaper}:{paper:PaperSize;setPaper:(paper:PaperSize)=>void}) {
 return <label className="flex items-center gap-2 text-xs font-semibold">Print paper
  <select className="rounded-lg border border-slate-300 p-2 bg-white" value={paper} onChange={e=>setPaper(e.target.value as PaperSize)}>
   <option value="A4">A4 test printer</option><option value="80mm">80 mm receipt</option><option value="58mm">58 mm receipt</option>
  </select><style media="print">{'@page { size: '+(paper==='A4'?'A4':'auto')+'; margin: '+(paper==='A4'?'12mm':'3mm')+'; }'}</style>
 </label>;
}
