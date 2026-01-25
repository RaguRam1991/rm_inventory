import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateBillRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useBills() {
  return useQuery({
    queryKey: [api.bills.list.path],
    queryFn: async () => {
      const res = await fetch(api.bills.list.path);
      if (!res.ok) throw new Error("Failed to fetch bills");
      return api.bills.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBillRequest) => {
      const res = await fetch(api.bills.create.path, {
        method: api.bills.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create bill");
      }
      return api.bills.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bills.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] }); // Items stock changed
      toast({ title: "Success", description: "Bill created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Transaction Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}
