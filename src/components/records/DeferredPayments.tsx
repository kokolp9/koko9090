import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, DollarSign, CreditCard, Printer, CheckCircle, XCircle, Edit } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  total: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paidAmount: number;
  remainingAmount: number;
  date: string;
}

const DeferredPayments = () => {
  const [deferredPayments, setDeferredPayments] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState('');
  const [showPartialPaymentDialog, setShowPartialPaymentDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedDeferred = localStorage.getItem('kairo_deferred_payments');
    if (savedDeferred) {
      setDeferredPayments(JSON.parse(savedDeferred));
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice({...invoice});
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingInvoice) return;

    const updatedPayments = deferredPayments.map(inv => 
      inv.id === editingInvoice.id ? editingInvoice : inv
    );
    
    setDeferredPayments(updatedPayments);
    localStorage.setItem('kairo_deferred_payments', JSON.stringify(updatedPayments));
    
    // Update in main invoices
    const savedInvoices = localStorage.getItem('kairo_invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const updatedInvoices = invoices.map((inv: Invoice) => 
        inv.id === editingInvoice.id ? editingInvoice : inv
      );
      localStorage.setItem('kairo_invoices', JSON.stringify(updatedInvoices));
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
        <h3>فاتورة مؤجلة رقم: ${invoice.invoiceNumber}</h3>
        <p>العميل: ${invoice.customerName}</p>
        <p>التاريخ: ${invoice.date}</p>
        <p>حالة الدفع: ${invoice.paymentStatus === 'pending' ? 'مؤجل' : 'دفع جزئي'}</p>
        <p>المبلغ المدفوع: ${invoice.paidAmount.toFixed(2)} جنيه</p>
        <p>المبلغ المتبقي: ${invoice.remainingAmount.toFixed(2)} جنيه</p>
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

  const handleFullPayment = (invoiceId: string) => {
    const invoice = deferredPayments.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    // Update invoice to fully paid
    const updatedInvoice: Invoice = {
      ...invoice,
      paymentStatus: 'paid',
      paidAmount: invoice.total,
      remainingAmount: 0
    };

    // Remove from deferred payments
    const updatedDeferred = deferredPayments.filter(inv => inv.id !== invoiceId);
    setDeferredPayments(updatedDeferred);
    localStorage.setItem('kairo_deferred_payments', JSON.stringify(updatedDeferred));

    // Update in main invoices
    const savedInvoices = localStorage.getItem('kairo_invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const invoiceIndex = invoices.findIndex((inv: Invoice) => inv.id === invoiceId);
      if (invoiceIndex !== -1) {
        invoices[invoiceIndex] = updatedInvoice;
        localStorage.setItem('kairo_invoices', JSON.stringify(invoices));
      }
    }

    toast({
      title: "تم الدفع بالكامل",
      description: "تم تسجيل الدفع الكامل للفاتورة",
    });
  };

  const handlePartialPayment = () => {
    if (!selectedInvoice || !partialPaymentAmount) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ الدفع",
        variant: "destructive",
      });
      return;
    }

    const paymentAmount = parseFloat(partialPaymentAmount);
    if (paymentAmount <= 0 || paymentAmount > selectedInvoice.remainingAmount) {
      toast({
        title: "خطأ",
        description: "مبلغ الدفع غير صحيح",
        variant: "destructive",
      });
      return;
    }

    const newPaidAmount = selectedInvoice.paidAmount + paymentAmount;
    const newRemainingAmount = selectedInvoice.total - newPaidAmount;
    const newPaymentStatus: 'paid' | 'partial' | 'pending' = newRemainingAmount === 0 ? 'paid' : 'partial';

    // Update invoice
    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      paymentStatus: newPaymentStatus,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount
    };

    // Update deferred payments
    let updatedDeferred;
    if (newPaymentStatus === 'paid') {
      // Remove from deferred if fully paid
      updatedDeferred = deferredPayments.filter(inv => inv.id !== selectedInvoice.id);
    } else {
      // Update in deferred payments
      updatedDeferred = deferredPayments.map(inv => 
        inv.id === selectedInvoice.id ? updatedInvoice : inv
      );
    }

    setDeferredPayments(updatedDeferred);
    localStorage.setItem('kairo_deferred_payments', JSON.stringify(updatedDeferred));

    // Update in main invoices
    const savedInvoices = localStorage.getItem('kairo_invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const invoiceIndex = invoices.findIndex((inv: Invoice) => inv.id === selectedInvoice.id);
      if (invoiceIndex !== -1) {
        invoices[invoiceIndex] = updatedInvoice;
        localStorage.setItem('kairo_invoices', JSON.stringify(invoices));
      }
    }

    setShowPartialPaymentDialog(false);
    setPartialPaymentAmount('');
    setSelectedInvoice(null);

    toast({
      title: "تم تسجيل الدفع الجزئي",
      description: `تم تسجيل دفع ${paymentAmount.toFixed(2)} جنيه`,
    });
  };

  const filteredPayments = deferredPayments.filter(payment =>
    payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-gradient-to-br from-orange-50 to-red-100 min-h-screen p-4">
      <Card className="border-l-4 border-l-orange-500 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardTitle className="flex items-center gap-2 justify-between text-white">
            <span>سجل المدفوعات المؤجلة</span>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-orange-600">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
          </CardTitle>
          <CardDescription className="text-orange-100">
            إدارة الفواتير غير المدفوعة والمدفوعة جزئياً
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-r from-gray-50 to-orange-50 p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث باسم العميل أو رقم الفاتورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-200 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden shadow-lg bg-white">
            <Table>
              <TableHeader className="bg-gradient-to-r from-orange-500 to-red-500">
                <TableRow>
                  <TableHead className="text-right font-semibold text-white">رقم الفاتورة</TableHead>
                  <TableHead className="text-right font-semibold text-white">اسم العميل</TableHead>
                  <TableHead className="text-right font-semibold text-white">رقم الهاتف</TableHead>
                  <TableHead className="text-right font-semibold text-white">الإجمالي</TableHead>
                  <TableHead className="text-right font-semibold text-white">المبلغ المدفوع</TableHead>
                  <TableHead className="text-right font-semibold text-white">المبلغ المتبقي</TableHead>
                  <TableHead className="text-right font-semibold text-white">حالة الدفع</TableHead>
                  <TableHead className="text-right font-semibold text-white">التاريخ</TableHead>
                  <TableHead className="text-right font-semibold text-white">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-orange-50 transition-colors">
                    <TableCell className="font-medium text-blue-600">{payment.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{payment.customerName}</TableCell>
                    <TableCell>{payment.customerPhone}</TableCell>
                    <TableCell className="font-semibold text-blue-600">{payment.total.toFixed(2)} جنيه</TableCell>
                    <TableCell className="font-medium text-green-600">{payment.paidAmount.toFixed(2)} جنيه</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {payment.remainingAmount.toFixed(2)} جنيه
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.paymentStatus === 'pending' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.paymentStatus === 'pending' ? 'مؤجل' : 'دفع جزئي'}
                        </span>
                        {payment.paymentStatus === 'pending' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(payment)}
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
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div>
                                    <strong>رقم الفاتورة:</strong> {selectedInvoice.invoiceNumber}
                                  </div>
                                  <div>
                                    <strong>اسم العميل:</strong> {selectedInvoice.customerName}
                                  </div>
                                  <div>
                                    <strong>رقم الهاتف:</strong> {selectedInvoice.customerPhone}
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
                                <div className="space-y-2 text-lg font-semibold bg-blue-50 p-4 rounded-lg">
                                  <div className="flex justify-between">
                                    <span>الإجمالي الكلي:</span>
                                    <span className="text-blue-600">{selectedInvoice.total.toFixed(2)} جنيه</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>المبلغ المدفوع:</span>
                                    <span className="text-green-600">{selectedInvoice.paidAmount.toFixed(2)} جنيه</span>
                                  </div>
                                  <div className="flex justify-between text-red-600">
                                    <span>المبلغ المتبقي:</span>
                                    <span>{selectedInvoice.remainingAmount.toFixed(2)} جنيه</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInvoice(payment)}
                          className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintInvoice(payment)}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleFullPayment(payment.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          دفع كامل
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(payment);
                            setShowPartialPaymentDialog(true);
                          }}
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          دفع جزئي
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
            <DialogTitle>تعديل الفاتورة المؤجلة</DialogTitle>
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

      <Dialog open={showPartialPaymentDialog} onOpenChange={setShowPartialPaymentDialog}>
        <DialogContent className="border-l-4 border-l-orange-500">
          <DialogHeader>
            <DialogTitle className="text-orange-800">دفع جزئي</DialogTitle>
            <DialogDescription>
              أدخل المبلغ المراد دفعه من الفاتورة رقم: {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <p><strong>المبلغ المتبقي:</strong> <span className="text-orange-600 font-semibold">{selectedInvoice?.remainingAmount.toFixed(2)} جنيه</span></p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">المبلغ المدفوع</label>
              <Input
                type="number"
                step="0.01"
                value={partialPaymentAmount}
                onChange={(e) => setPartialPaymentAmount(e.target.value)}
                placeholder="أدخل المبلغ المدفوع"
                max={selectedInvoice?.remainingAmount}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePartialPayment} className="bg-green-600 hover:bg-green-700">
                تسجيل الدفع
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPartialPaymentDialog(false);
                  setPartialPaymentAmount('');
                  setSelectedInvoice(null);
                }}
                className="border-gray-300 hover:bg-gray-50"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeferredPayments;
