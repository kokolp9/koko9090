
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Trash2 } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  items: any[];
  total: number;
  date: string;
}

const InvoiceArchive = () => {
  const [archivedInvoices, setArchivedInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedArchive = localStorage.getItem('kairo_invoice_archive');
    if (savedArchive) {
      setArchivedInvoices(JSON.parse(savedArchive));
    }
  }, []);

  const handleDeleteInvoice = (invoiceId: string) => {
    // Delete without affecting inventory
    const updatedArchive = archivedInvoices.filter(invoice => invoice.id !== invoiceId);
    setArchivedInvoices(updatedArchive);
    localStorage.setItem('kairo_invoice_archive', JSON.stringify(updatedArchive));

    toast({
      title: "تم حذف الفاتورة",
      description: "تم حذف الفاتورة من الأرشيف",
    });
  };

  const filteredInvoices = archivedInvoices.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>أرشيف الفواتير</CardTitle>
          <CardDescription>
            عرض وإدارة الفواتير المؤرشفة
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
                  <TableHead className="text-right">رقم الفاتورة</TableHead>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">عدد المنتجات</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{invoice.items.length}</TableCell>
                    <TableCell>{invoice.total.toFixed(2)} جنيه</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل الفاتورة</DialogTitle>
                              <DialogDescription>
                                عرض تفاصيل الفاتورة رقم: {selectedInvoice?.invoiceNumber}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedInvoice && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <strong>رقم الفاتورة:</strong> {selectedInvoice.invoiceNumber}
                                  </div>
                                  <div>
                                    <strong>اسم العميل:</strong> {selectedInvoice.customerName}
                                  </div>
                                  <div>
                                    <strong>التاريخ:</strong> {selectedInvoice.date}
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
                                      {selectedInvoice.items.map((item, index) => (
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
                                  الإجمالي الكلي: {selectedInvoice.total.toFixed(2)} جنيه
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
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

export default InvoiceArchive;
