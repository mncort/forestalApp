'use client'
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting';

/**
 * Componente que muestra los totales del presupuesto (subtotal, impuestos, total)
 */
export default function PresupuestoTotals({ totales, efectivo, onEfectivoChange }) {
  const { subtotal, moneda, porcentajeImpuesto, impuesto, total } = totales;

  return (
    <div className="bg-muted p-4 rounded-lg space-y-4">
      {/* Selector de tipo de pago */}
      <div className="space-y-2">
        <Label htmlFor="payment-type" className="font-medium">Tipo de Pago</Label>
        <Select value={efectivo.toString()} onValueChange={(value) => onEfectivoChange(value === 'true')}>
          <SelectTrigger id="payment-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Tarjeta/Transferencia (IVA 21%)</SelectItem>
            <SelectItem value="true">Efectivo (IVA 10.5%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Totales */}
      <div className="border-t border-border my-2"></div>

      <div className="space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium text-lg">
            {formatCurrency(subtotal)} {moneda}
          </span>
        </div>

        {/* IVA */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            IVA ({formatPercentage(porcentajeImpuesto, false)}):
            <div title={efectivo ? "Medio IVA - Pago en efectivo" : "IVA Completo - Tarjeta/Transferencia"}>
              <Info size={14} className="text-blue-500" />
            </div>
          </span>
          <span className="font-medium">
            {formatCurrency(impuesto)} {moneda}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-border my-2"></div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">TOTAL:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(total)} {moneda}
          </span>
        </div>
      </div>

      {/* Nota sobre tipo de pago */}
      <div className="bg-primary/10 border border-primary/30 rounded-md p-3 text-sm flex gap-2">
        <Info size={16} className="text-primary flex-shrink-0" />
        <span className="text-foreground">
          {efectivo
            ? 'Pago en efectivo - Medio IVA (10.5%)'
            : 'Pago con Tarjeta/Transferencia - IVA Completo (21%)'}
        </span>
      </div>
    </div>
  );
}
