
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Trash2 } from 'lucide-react';

interface InvoiceReturn {
  id: string;
  customerName: string;
  items: any[];
  total: number;
  date: string;
}

const InvoiceReturnRecord = () => {
  const [invoiceReturns, setInvoiceReturns] = useState<InvoiceReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<InvoiceReturn | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedReturns = localStorage.getItem('kairo_invoice_returns');
    if (savedReturns) {
      setInvoiceReturns(JSON.parse(savedReturns));
    }
  }, []);

  const handleDeleteReturn = (returnId: string) => {
    const updatedReturns = invoiceReturns.filter(returnItem => returnItem.id !== returnId);
    setInvoiceReturns(updatedReturns);
    localStorage.setItem('kairo_invoice_returns', JSON.stringify(updatedReturns));

    toast({
      title: "تم حذف المرتجع",
      description: "تم حذف مرتجع الفواتير",
    });
  };

  const filteredReturns = invoiceReturns.filter(returnItem =>
    returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>سجل مرتجع الفواتير</CardTitle>
          <CardDescription>
            عرض وإدارة مرتجعات الفواتير
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث باسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">عدد المنتجات</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((returnItem) => (
                  <TableRow key={returnItem.id}>
                    <TableCell className="font-medium">{returnItem.customerName}</TableCell>
                    <TableCell>{returnItem.items.length}</TableCell>
                    <TableCell>{returnItem.total.toFixed(2)} جنيه</TableCell>
                    <TableCell>{returnItem.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReturn(returnItem)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل المرتجع</DialogTitle>
                              <DialogDescription>
                                عرض تفاصيل مرتجع الفواتير للعميل: {selectedReturn?.customerName}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedReturn && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <strong>اسم العميل:</strong> {selectedReturn.customerName}
                                  </div>
                                  <div>
                                    <strong>التاريخ:</strong> {selectedReturn.date}
                                  </div>
                                </div>
                                <div>
                                  <strong>المنتجات:</strong>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-right">المنتج</TableHead>
                                        <TableHead className="text-right">الكمية</TableHead>
                                        <TableHead className="text-right">السعر</TableHead>
                                        <TableHead className="text-right">الإجمالي</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedReturn.items.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.productName}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                                          <TableCell>{item.total.toFixed(2)} جنيه</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                <div className="text-lg font-semibold">
                                  الإجمالي الكلي: {selectedReturn.total.toFixed(2)} جنيه
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteReturn(returnItem.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceReturnRecord;
