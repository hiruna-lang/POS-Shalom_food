import { Order, AppSettings, KitchenTarget } from '../types/pos';
export const receiptAmount = (amount: number) => amount.toLocaleString('en-LK', {minimumFractionDigits: 2, maximumFractionDigits: 2});
export const receiptTime = (date: string) => new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(date));
export const orderToken = (number: string) => number.match(/(\d+)$/)?.[1] || number;
export const orderTypeLabel = (type: Order['type']) => ({dine_in:'DINE IN',takeaway:'TAKE-AWAY',delivery:'DELIVERY'})[type];
export function kitchenTickets(order: Order, settings: AppSettings) {
 return (['kitchen_1','kitchen_2'] as KitchenTarget[]).map((target,index)=>({
 target,title:'KITCHEN '+(index+1),
 items:order.items.filter(item=>(item.kitchenTarget || settings.kitchenRouting[item.menuItem.categoryId] || item.menuItem.kitchen)===target)
 })).filter(ticket=>ticket.items.length>0);
}
