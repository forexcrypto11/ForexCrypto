"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order, NewOrder, TradeType, TradeStatus } from '@/app/types/orders';
import LoadingButton from '@/app/components/ui/loading-button';

type EditOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  onDelete: (orderId: string) => void;
  order: Order | null;
  mode: 'create' | 'edit';
  userId: string;
};

export function EditOrderModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  order,
  mode,
  userId,
}: EditOrderModalProps) {
  const [formData, setFormData] = useState<NewOrder>({
    userId,
    symbol: "",
    quantity: 0,
    buyPrice: 0,
    sellPrice: 0,
    tradeAmount: 0,
    type: TradeType.LONG,
    status: TradeStatus.OPEN,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        userId,
        symbol: order.symbol,
        quantity: order.quantity,
        buyPrice: order.buyPrice,
        sellPrice: order.sellPrice || 0,
        tradeAmount: order.quantity * order.buyPrice,
        type: order.type === 'BUY' ? TradeType.LONG : TradeType.SHORT,
        status: order.status as unknown as TradeStatus,
      });
    } else {
      setFormData({
        userId,
        symbol: "",
        quantity: 0,
        buyPrice: 0,
        sellPrice: 0,
        tradeAmount: 0,
        type: TradeType.LONG,
        status: TradeStatus.OPEN,
      });
    }
  }, [order, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const profitLoss = formData.sellPrice 
        ? (formData.sellPrice - (formData.buyPrice || 0)) * (formData.quantity || 0)
        : null;
    
      onSave({
        ...formData,
        type: formData.type === TradeType.LONG ? 'BUY' : 'SELL',
        id: order?.id || "",
        profitLoss,
        createdAt: (typeof order?.createdAt === 'string' ? new Date(order.createdAt) : order?.createdAt || new Date()).toISOString(),
        updatedAt: new Date().toISOString(),
      } as Order);
      
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (order?.id && onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(order.id);
        onClose(); // Close the modal after deletion
      } catch (error) {
        console.error('Error deleting order:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Order' : 'Edit Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g., BTC/USD"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TradeType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TradeType.LONG}>Long</SelectItem>
                  <SelectItem value={TradeType.SHORT}>Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                placeholder="Enter quantity"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyPrice">Buy Price</Label>
              <Input
                id="buyPrice"
                type="number"
                value={formData.buyPrice}
                onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                placeholder="Enter buy price"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Sell Price</Label>
              <Input
                id="sellPrice"
                type="number"
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                placeholder="Enter sell price"
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TradeStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TradeStatus.OPEN}>Open</SelectItem>
                  <SelectItem value={TradeStatus.CLOSED}>Closed</SelectItem>
                  <SelectItem value={TradeStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TradeStatus.PENDING_SELL}>Pending Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {mode === 'edit' && order && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              variant="default"
              loadingMessage={mode === 'create' ? "Creating order..." : "Saving changes..."}
            >
              {mode === 'create' ? 'Create Order' : 'Save Changes'}
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}