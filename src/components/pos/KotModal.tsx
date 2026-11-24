import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Order } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { KitchenReceipts, PrintPaper, PaperSize } from './OrderDocuments';
import { kitchenTickets } from '../../utils/receipt';

export function KotModal({isOpen,onClose,order}:{isOpen:boolean;onClose:()=>void;order:Order}) {
 const {settings}=usePos();
 const [paper,setPaper]=useState<PaperSize>('A4'),[reprint,setReprint]=useState(false);
 const hasTickets=kitchenTickets(order,settings).length>0;
 return <Modal isOpen={isOpen} onClose={onClose} title="Kitchen Order Tickets" subtitle={'Station tickets for '+order.orderNumber} maxWidth="2xl">
  <div className="space-y-4">
   <div className="flex flex-wrap items-center justify-between gap-3 document-print-controls"><PrintPaper paper={paper} setPaper={setPaper}/><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={reprint} onChange={e=>setReprint(e.target.checked)}/>Mark as reprint</label></div>
   <p className="text-xs text-slate-500 document-print-controls">Each kitchen receives only its assigned items. Tickets print on separate pages; choose the destination in your browser print dialog.</p>
   <div id="printable-kot" className="kot-preview" data-paper={paper}><KitchenReceipts order={order} settings={settings} reprint={reprint}/></div>
   {!hasTickets&&<p className="p-4 text-center text-sm text-slate-500">No kitchen-routed items on this order.</p>}
   <div className="flex gap-3 document-print-controls"><button type="button" className="primary-action flex-1" disabled={!hasTickets} onClick={()=>window.print()}><Printer size={16}/>Print kitchen tickets</button><button type="button" className="secondary-action" onClick={onClose}>Close</button></div>
  </div>
 </Modal>;
}
