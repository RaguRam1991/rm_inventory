import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema, type InsertItem, type Item } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { useCreateItem, useUpdateItem } from "@/hooks/use-items";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ItemFormProps {
  itemToEdit?: Item;
  onSuccess: () => void;
}

export function ItemForm({ itemToEdit, onSuccess }: ItemFormProps) {
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  
  const isEditing = !!itemToEdit;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      price: "0",
      quantity: 0,
      minQuantity: 5,
    }
  });

  // Reset form when itemToEdit changes
  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        name: itemToEdit.name,
        sku: itemToEdit.sku || "",
        category: itemToEdit.category,
        description: itemToEdit.description || "",
        price: itemToEdit.price,
        quantity: itemToEdit.quantity,
        minQuantity: itemToEdit.minQuantity || 5,
      });
    } else {
      form.reset({
        name: "",
        sku: "",
        category: "",
        description: "",
        price: "0",
        quantity: 0,
        minQuantity: 5,
      });
    }
  }, [itemToEdit, form]);

  function onSubmit(data: InsertItem) {
    if (isEditing && itemToEdit) {
      updateMutation.mutate(
        { id: itemToEdit.id, ...data },
        { onSuccess }
      );
    } else {
      createMutation.mutate(data, { onSuccess });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Premium Towel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="TOW-001" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Housekeeping" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minQuantity"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Low Stock Alert Level</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || 0} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Item details..." {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Item" : "Create Item"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
