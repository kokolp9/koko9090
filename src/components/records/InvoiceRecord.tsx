import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Trash2, Edit, Printer } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: any[];
  total: number;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  paidAmount?: number;
  remainingAmount?: number;
  date: string;
}

const InvoiceRecord = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedInvoices = localStorage.getItem('kairo_invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }

    const savedProducts = localStorage.getItem('kairo_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoiceToDelete = invoices.find(invoice => invoice.id === invoiceId);
    if (!invoiceToDelete) return;

    // Return products to inventory
    const updatedProducts = [...products];
    invoiceToDelete.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.name === item.productName);
      if (productIndex !== -1) {
        updatedProducts[productIndex].quantity += item.quantity;
      }
    });

    // Update invoices list
    const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
    setInvoices(updatedInvoices);
    
    // Remove from deferred payments if exists
    const savedDeferred = localStorage.getItem('kairo_deferred_payments');
    if (savedDeferred) {
      const deferred = JSON.parse(savedDeferred);
      const updatedDeferred = deferred.filter((inv: Invoice) => inv.id !== invoiceId);
      localStorage.setItem('kairo_deferred_payments', JSON.stringify(updatedDeferred));
    }
    
    // Save to localStorage
    localStorage.setItem('kairo_invoices', JSON.stringify(updatedInvoices));
    localStorage.setItem('kairo_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    toast({
      title: "تم حذف الفاتورة",
      description: "تم حذف الفاتورة وإرجاع المنتجات للمخزون",
    });
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice({...invoice});
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingInvoice) return;

    const updatedInvoices = invoices.map(inv => 
      inv.id === editingInvoice.id ? editingInvoice : inv
    );
    
    setInvoices(updatedInvoices);
    localStorage.setItem('kairo_invoices', JSON.stringify(updatedInvoices));
    
    // Update deferred payments if needed
    const savedDeferred = localStorage.getItem('kairo_deferred_payments');
    if (savedDeferred) {
      const deferred = JSON.parse(savedDeferred);
      const updatedDeferred = deferred.map((inv: Invoice) => 
        inv.id === editingInvoice.id ? editingInvoice : inv
      );
      localStorage.setItem('kairo_deferred_payments', JSON.stringify(updatedDeferred));
    }
    
    setEditDialogOpen(false);
    setEditingInvoice(null);
    
    toast({
      title: "تم تحديث الفاتورة",
      description: "تم حفظ التعديلات بنجاح",
    });
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const printContent = `
      <div style="font-family: Arial; direction: rtl; text-align: right;">
        <h2>مؤسسة كايرو للأدوات الصحية</h2>
        <p>سوهاج - دار السلام - نجوع مازن شرق</p>
        <p>01225680001 - 01011085134</p>
        <hr>
        <h3>فاتورة رقم: ${invoice.invoiceNumber}</h3>
        <p>العميل: ${invoice.customerName}</p>
        <p>التاريخ: ${invoice.date}</p>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.quantity}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <h3>الإجمالي: ${invoice.total.toFixed(2)} جنيه</h3>
      </div>
    `;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow!.document.write(printContent);
    printWindow!.document.close();
    printWindow!.print();
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentStatusText = (status?: string) => {
    switch (status) {
      case 'paid': return 'تم الدفع';
      case 'partial': return 'دفع جزئي';
      case 'pending': return 'مؤجل';
      default: return 'تم الدفع';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4">
      <Card className="shadow-2xl border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardTitle className="text-white">سجل الفواتير</CardTitle>
          <CardDescription className="text-green-100">
            عرض وإدارة جميع الفواتير المصدرة
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-r from-gray-50 to-green-50 p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث باسم العميل أو رقم الفاتورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-gray-300 focus:border-green-500 focus:ring-green-200 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden shadow-lg bg-white">
            <Table>
              <TableHeader className="bg-gradient-to-r from-green-500 to-emerald-500">
                <TableRow>
                  <TableHead className="text-right font-semibold text-white">رقم الفاتورة</TableHead>
                  <TableHead className="text-right font-semibold text-white">اسم العميل</TableHead>
                  <TableHead className="text-right font-semibold text-white">رقم الهاتف</TableHead>
                  <TableHead className="text-right font-semibold text-white">عدد المنتجات</TableHead>
                  <TableHead className="text-right font-semibold text-white">الإجمالي</TableHead>
                  <TableHead className="text-right font-semibold text-white">حالة الدفع</TableHead>
                  <TableHead className="text-right font-semibold text-white">المبلغ المتبقي</TableHead>
                  <TableHead className="text-right font-semibold text-white">التاريخ</TableHead>
                  <TableHead className="text-right font-semibold text-white">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-green-50 transition-colors">
                    <TableCell className="font-medium text-blue-600">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{invoice.customerName}</TableCell>
                    <TableCell>{invoice.customerPhone || '-'}</TableCell>
                    <TableCell>{invoice.items.length}</TableCell>
                    <TableCell className="font-semibold text-green-600">{invoice.total.toFixed(2)} جنيه</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                        {getPaymentStatusText(invoice.paymentStatus)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {invoice.remainingAmount && invoice.remainingAmount > 0 ? (
                        <span className="text-red-600 font-semibold">
                          {invoice.remainingAmount.toFixed(2)} جنيه
                        </span>
                      ) : (
                        <span className="text-green-600">0 جنيه</span>
                      )}
                    </TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-blue-800">تفاصيل الفاتورة</DialogTitle>
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
                                    <strong>رقم الهاتف:</strong> {selectedInvoice.customerPhone || 'غير محدد'}
                                  </div>
                                  <div>
                                    <strong>التاريخ:</strong> {selectedInvoice.date}
                                  </div>
                                  {selectedInvoice.customerAddress && (
                                    <div className="col-span-2">
                                      <strong>العنوان:</strong> {selectedInvoice.customerAddress}
                                    </div>
                                  )}
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
                                <div className="space-y-2 text-lg font-semibold">
                                  <div className="flex justify-between">
                                    <span>الإجمالي الكلي:</span>
                                    <span>{selectedInvoice.total.toFixed(2)} جنيه</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>حالة الدفع:</span>
                                    <span className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(selectedInvoice.paymentStatus)}`}>
                                      {getPaymentStatusText(selectedInvoice.paymentStatus)}
                                    </span>
                                  </div>
                                  {selectedInvoice.paidAmount !== undefined && (
                                    <div className="flex justify-between">
                                      <span>المبلغ المدفوع:</span>
                                      <span>{selectedInvoice.paidAmount.toFixed(2)} جنيه</span>
                                    </div>
                                  )}
                                  {selectedInvoice.remainingAmount !== undefined && selectedInvoice.remainingAmount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                      <span>المبلغ المتبقي:</span>
                                      <span>{selectedInvoice.remainingAmount.toFixed(2)} جنيه</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                          className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintInvoice(invoice)}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="bg-red-500 hover:bg-red-600"
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الفاتورة</DialogTitle>
            <DialogDescription>
              تعديل بيانات الفاتورة رقم: {editingInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">اسم العميل</label>
                <Input
                  value={editingInvoice.customerName}
                  onChange={(e) => setEditingInvoice({...editingInvoice, customerName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <Input
                  value={editingInvoice.customerPhone || ''}
                  onChange={(e) => setEditingInvoice({...editingInvoice, customerPhone: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">العنوان</label>
                <Input
                  value={editingInvoice.customerAddress || ''}
                  onChange={(e) => setEditingInvoice({...editingInvoice, customerAddress: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                  حفظ التعديلات
                </Button>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceRecord;
