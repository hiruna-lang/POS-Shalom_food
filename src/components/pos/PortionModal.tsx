import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { CartItem, MenuItem } from '../../types/pos';
import { getPortions } from '../../utils/portions';
import { formatLkr } from '../../utils/billing';
import { Modal } from '../common/Modal';

export function PortionModal({ item, line, onClose, onConfirm }: {
  item: MenuItem;
  line?: CartItem;
  onClose: () => void;
  onConfirm: (quantity: number, notes: string, portion: string) => void;
}) {
  const portions = getPortions(item);
  const [portion, setPortion] = useState(() => portions.find((option) =>
    option.name.toLowerCase() === line?.portion?.trim().toLowerCase()));
  const [quantity, setQuantity] = useState(line?.quantity ?? 1);
  const [notes, setNotes] = useState(line?.notes ?? '');
  const [saving, setSaving] = useState(false);

  return (
    <Modal isOpen onClose={onClose} title={item.name} maxWidth="md" compact>
      <form className="portion-form" onSubmit={(event) => {
        event.preventDefault();
        if (saving || !item.isAvailable || !portion) return;
        setSaving(true);
        onConfirm(quantity, notes, portion.name);
      }}>
        <div className="portion-form-content">
        {item.image && <img src={item.image} alt="" className="portion-preview w-full rounded-xl bg-slate-100 object-cover" />}
        <fieldset>
          <legend className="mb-2 text-sm font-bold">Portion size</legend>
          <div className="grid grid-cols-3 gap-2">
            {portions.map((option) => (
              <label className="portion-option" key={option.name}>
                <input className="sr-only" type="radio" name="portion" checked={option.name === portion?.name} onChange={() => setPortion(option)} />
                <span><strong>{option.name}</strong>{option.name === portion?.name && <Check size={16} />}</span>
                <small>{formatLkr(option.price)}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Quantity</span>
          <div className="flex items-center gap-2">
            <button type="button" className="secondary-action" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={17} /></button>
            <output className="min-w-6 text-center font-bold tabular-nums">{quantity}</output>
            <button type="button" className="secondary-action" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><Plus size={17} /></button>
          </div>
        </div>
        <label className="block text-sm font-bold">Kitchen instructions
          <textarea className="portion-notes mt-1 block w-full rounded-xl border p-2 font-normal" rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        </div>
        <div className="portion-form-footer">
          <strong className="tabular-nums">{portion ? formatLkr(Math.round(portion.price * 100) * quantity / 100) : 'Select a size'}</strong>
          <div className="flex gap-2">
            <button type="button" className="secondary-action" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-action" disabled={saving || !item.isAvailable || !portion}>{line ? 'Save changes' : 'Add to order'}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
