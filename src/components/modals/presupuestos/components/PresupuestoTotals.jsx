'use client'
import { Info } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting';

/**
 * Componente que muestra los totales del presupuesto (subtotal, impuestos, total)
 */
export default function PresupuestoTotals({ totales, efectivo, onEfectivoChange }) {
  const { subtotal, moneda, porcentajeImpuesto, impuesto, total } = totales;

  return (
    <div className="bg-base-200 p-4 rounded-lg space-y-4">
      {/* Selector de tipo de pago */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Tipo de Pago</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={efectivo.toString()}
          onChange={(e) => onEfectivoChange(e.target.value === 'true')}
        >
          <option value="false">Tarjeta/Transferencia (IVA 21%)</option>
          <option value="true">Efectivo (IVA 10.5%)</option>
        </select>
      </div>

      {/* Totales */}
      <div className="divider my-2"></div>

      <div className="space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-base-content/70">Subtotal:</span>
          <span className="font-medium text-lg">
            {formatCurrency(subtotal)} {moneda}
          </span>
        </div>

        {/* IVA */}
        <div className="flex justify-between items-center">
          <span className="text-base-content/70 flex items-center gap-1">
            IVA ({formatPercentage(porcentajeImpuesto, false)}):
            <div className="tooltip tooltip-right" data-tip={efectivo ? "Medio IVA - Pago en efectivo" : "IVA Completo - Tarjeta/Transferencia"}>
              <Info size={14} className="text-info" />
            </div>
          </span>
          <span className="font-medium">
            {formatCurrency(impuesto)} {moneda}
          </span>
        </div>

        {/* Total */}
        <div className="divider my-2"></div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">TOTAL:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(total)} {moneda}
          </span>
        </div>
      </div>

      {/* Nota sobre tipo de pago */}
      <div className="alert alert-info text-xs">
        <Info size={16} />
        <span>
          {efectivo
            ? 'Pago en efectivo - Medio IVA (10.5%)'
            : 'Pago con Tarjeta/Transferencia - IVA Completo (21%)'}
        </span>
      </div>
    </div>
  );
}
