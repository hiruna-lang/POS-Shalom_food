import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Order } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { CustomerReceipt, PrintPaper, PaperSize } from './OrderDocuments';

export function ReceiptModal({isOpen,onClose,order}:{isOpen:boolean;onClose:()=>void;order:Order}) {
 const {settings}=usePos();
 const [paper,setPaper]=useState<PaperSize>('A4');
 return <Modal isOpen={isOpen} onClose={onClose} title="Customer Bill Preview" subtitle={'Receipt for '+order.orderNumber} maxWidth="lg">
  <div className="space-y-4">
   <div className="document-print-controls"><PrintPaper paper={paper} setPaper={setPaper}/><p className="text-xs text-slate-500">Choose the matching paper size in your printer dialog.</p></div>
   <div id="printable-receipt" className="receipt-preview" data-paper={paper}><CustomerReceipt order={order} settings={settings}/></div>
   <div className="flex gap-3 document-print-controls"><button type="button" className="primary-action flex-1" onClick={()=>window.print()}><Printer size={16}/>Print Receipt</button><button type="button" className="secondary-action" onClick={onClose}>Done</button></div>
  </div>
 </Modal>;
}
