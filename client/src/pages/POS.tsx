import { useState } from "react";
import { useItems } from "@/hooks/use-items";
import { useCreateBill } from "@/hooks/use-bills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, User, Loader2 } from "lucide-react";
import type { Item } from "@shared/schema";

interface CartItem {
  item: Item;
  quantity: number;
}

export default function POS() {
  const { data: items = [] } = useItems();
  const createBillMutation = useCreateBill();
  
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.quantity) return prev; // Cannot exceed stock
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart(prev => prev.map(line => {
      if (line.item.id === itemId) {
        const newQty = line.quantity + delta;
        if (newQty <= 0) return line;
        if (newQty > line.item.quantity) return line;
        return { ...line, quantity: newQty };
      }
      return line;
    }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, line) => sum + (parseFloat(line.item.price) * line.quantity), 0);

  const handleCheckout = () => {
    if (!customerName || cart.length === 0) return;

    createBillMutation.mutate({
      customerName,
      paymentMethod,
      items: cart.map(line => ({ itemId: line.item.id, quantity: line.quantity }))
    }, {
      onSuccess: () => {
        setCart([]);
        setCustomerName("");
        setPaymentMethod("Cash");
      }
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Left: Item Selector */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search items to add..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredItems.map(item => (
              <button
                key={item.id}
                disabled={item.quantity === 0}
                onClick={() => addToCart(item)}
                className="group text-left bg-white p-4 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-slate-50">{item.category}</Badge>
                  <span className={item.quantity <= 5 ? "text-red-500 font-bold text-xs" : "text-green-600 text-xs font-medium"}>
                    {item.quantity} in stock
                  </span>
                </div>
                <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-lg font-bold text-primary mt-1">${item.price}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Cart & Checkout */}
      <Card className="w-full lg:w-[400px] flex flex-col shadow-xl shadow-black/5 border-border/50 h-full">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Current Bill
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(line => (
                  <div key={line.item.id} className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{line.item.name}</p>
                      <p className="text-sm text-muted-foreground">${line.item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg border px-1 h-8">
                      <button 
                        onClick={() => updateQuantity(line.item.id, -1)}
                        className="w-6 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-medium text-sm">{line.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(line.item.id, 1)}
                        className="w-6 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(line.item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Customer Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Guest Name / Room #" 
                    className="pl-9 bg-white"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Room Charge">Room Charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            
            <div className="flex justify-between items-end">
              <span className="text-muted-foreground font-medium">Total</span>
              <span className="text-3xl font-bold font-display text-primary">${cartTotal.toFixed(2)}</span>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-bold shadow-lg shadow-primary/20"
              disabled={cart.length === 0 || !customerName || createBillMutation.isPending}
              onClick={handleCheckout}
            >
              {createBillMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              Complete Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
