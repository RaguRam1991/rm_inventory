import { useState } from "react";
import { useItems, useDeleteItem } from "@/hooks/use-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Filter } from "lucide-react";
import { ItemForm } from "@/components/ItemForm";
import type { Item } from "@shared/schema";

export default function Inventory() {
  const { data: items = [], isLoading } = useItems();
  const deleteMutation = useDeleteItem();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(items.map(i => i.category)));

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary">Inventory Management</h2>
          <p className="text-muted-foreground mt-1">Track stock, pricing, and categories.</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
            </DialogHeader>
            <ItemForm 
              itemToEdit={editingItem} 
              onSuccess={handleFormClose} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or SKU..." 
            className="pl-9 bg-white/50 border-white/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Badge 
            variant={categoryFilter === "" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => setCategoryFilter("")}
          >
            All
          </Badge>
          {uniqueCategories.map(cat => (
            <Badge 
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 overflow-hidden border border-border/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Item Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading inventory...</TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No items found. Try adjusting your filters or add a new item.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.quantity <= (item.minQuantity || 5);
                return (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {item.price}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={isLowStock ? "text-red-600 font-bold" : "text-foreground"}>
                          {item.quantity}
                        </span>
                        {isLowStock && (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Low Stock</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
