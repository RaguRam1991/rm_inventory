import { useBills } from "@/hooks/use-bills";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, User, CreditCard, Calendar } from "lucide-react";

export default function History() {
  const { data: bills = [], isLoading } = useBills();

  // Sort by newest first
  const sortedBills = [...bills].sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary">Transaction History</h2>
        <p className="text-muted-foreground mt-1">View past bills and details.</p>
      </div>

      <Card className="border-none shadow-lg shadow-black/5">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading history...</div>
            ) : sortedBills.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions found.</div>
            ) : (
              sortedBills.map((bill) => (
                <AccordionItem key={bill.id} value={`bill-${bill.id}`} className="px-6 border-b last:border-0">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">#{bill.id}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{bill.customerName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-left sm:text-right">
                        <div className="flex flex-col sm:items-end">
                          <p className="font-bold text-primary text-lg">${bill.totalAmount}</p>
                          <Badge variant="secondary" className="text-xs w-fit">
                            {bill.paymentMethod}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {bill.createdAt ? format(new Date(bill.createdAt), "MMM d, HH:mm") : "N/A"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b-slate-200">
                            <TableHead className="w-[60%]">Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bill.items.map((item) => (
                            <TableRow key={item.id} className="border-0">
                              <TableCell className="font-medium">{item.itemName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">${item.priceAtTime}</TableCell>
                              <TableCell className="text-right font-medium">
                                ${(parseFloat(item.priceAtTime) * item.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t border-slate-200 bg-slate-100/50 font-bold">
                            <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                            <TableCell className="text-right text-primary">${bill.totalAmount}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
