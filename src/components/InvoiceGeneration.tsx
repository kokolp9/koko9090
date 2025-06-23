import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, Save, Printer, Archive } from 'lucide-react';

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
}

const InvoiceGeneration = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'pending'>('paid');
  const [paidAmount, setPaidAmount] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('kairo_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    
    // Generate invoice number
    const savedInvoices = localStorage.getItem('kairo_invoices');
    const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
    setInvoiceNumber(`INV-${Date.now()}`);
  }, []);

  const handleAddItem = () => {
    if (!productName || !quantity || !price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const requestedQuantity = parseInt(quantity);
    const itemPrice = parseFloat(price);

    // Check if product exists in inventory
    const existingProduct = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
    if (!existingProduct) {
      toast({
        title: "تحذير",
        description: "المنتج غير موجود في المخزون - سيتم إضافته كمنتج جديد",
        variant: "destructive",
      });
    } else if (existingProduct.quantity < requestedQuantity) {
      toast({
        title: "تحذير",
        description: `الكمية المتاحة في المخزون: ${existingProduct.quantity}`,
        variant: "destructive",
      });
    }

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productName,
      quantity: requestedQuantity,
      price: itemPrice,
      total: requestedQuantity * itemPrice
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setProductName('');
    setQuantity('');
    setPrice('');
    
    toast({
      title: "تم إضافة المنتج",
      description: "تم إضافة المنتج إلى الفاتورة",
    });
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleArchiveInvoice = () => {
    if (!customerName || invoiceItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل وإضافة منتجات",
        variant: "destructive",
      });
      return;
    }

    const total = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    let finalPaidAmount = 0;
    let remainingAmount = total;

    if (paymentStatus === 'paid') {
      finalPaidAmount = total;
      remainingAmount = 0;
    } else if (paymentStatus === 'partial' && paidAmount) {
      finalPaidAmount = parseFloat(paidAmount);
      remainingAmount = total - finalPaidAmount;
      if (finalPaidAmount >= total) {
        finalPaidAmount = total;
        remainingAmount = 0;
      }
    }

    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber,
      customerName,
      customerPhone,
      customerAddress,
      items: invoiceItems,
      total,
      paymentStatus,
      paidAmount: finalPaidAmount,
      remainingAmount,
      date: new Date().toLocaleDateString('ar-EG')
    };

    // Save to archive without deducting from inventory
    const savedArchive = localStorage.getItem('kairo_invoice_archive');
    const archive = savedArchive ? JSON.parse(savedArchive) : [];
    archive.push(newInvoice);
    localStorage.setItem('kairo_invoice_archive', JSON.stringify(archive));

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setInvoiceItems([]);
    setPaymentStatus('paid');
    setPaidAmount('');
    setInvoiceNumber(`INV-${Date.now()}`);
    
    toast({
      title: "تم أرشفة الفاتورة",
      description: "تم حفظ الفاتورة في الأرشيف بدون خصم من المخزون",
    });
  };

  const handleSaveInvoice = () => {
    if (!customerName || invoiceItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل وإضافة منتجات",
        variant: "destructive",
      });
      return;
    }

    const total = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    let finalPaidAmount = 0;
    let remainingAmount = total;

    if (paymentStatus === 'paid') {
      finalPaidAmount = total;
      remainingAmount = 0;
    } else if (paymentStatus === 'partial' && paidAmount) {
      finalPaidAmount = parseFloat(paidAmount);
      remainingAmount = total - finalPaidAmount;
      if (finalPaidAmount >= total) {
        finalPaidAmount = total;
        remainingAmount = 0;
      }
    }

    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber,
      customerName,
      customerPhone,
      customerAddress,
      items: invoiceItems,
      total,
      paymentStatus,
      paidAmount: finalPaidAmount,
      remainingAmount,
      date: new Date().toLocaleDateString('ar-EG')
    };

    // Update inventory - deduct quantities
    const updatedProducts = products.map(product => {
      const invoiceItem = invoiceItems.find(item => item.productName === product.name);
      if (invoiceItem) {
        return {
          ...product,
          quantity: Math.max(0, product.quantity - invoiceItem.quantity)
        };
      }
      return product;
    });

    // Save invoice
    const savedInvoices = localStorage.getItem('kairo_invoices');
    const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
    invoices.push(newInvoice);
    localStorage.setItem('kairo_invoices', JSON.stringify(invoices));

    // Save updated products
    localStorage.setItem('kairo_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // If payment is deferred, add to deferred payments
    if (paymentStatus === 'partial' || paymentStatus === 'pending') {
      const savedDeferred = localStorage.getItem('kairo_deferred_payments');
      const deferred = savedDeferred ? JSON.parse(savedDeferred) : [];
      deferred.push(newInvoice);
      localStorage.setItem('kairo_deferred_payments', JSON.stringify(deferred));
    }

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setInvoiceItems([]);
    setPaymentStatus('paid');
    setPaidAmount('');
    setInvoiceNumber(`INV-${Date.now()}`);
    
    toast({
      title: "تم حفظ الفاتورة",
      description: "تم إنشاء الفاتورة وتحديث المخزون بنجاح",
    });
  };

  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4">
      <Card className="border-l-4 border-l-blue-600 shadow-2xl bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="text-center mb-4 border-b pb-4 bg-white rounded-lg shadow-sm p-4">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">مؤسسة كيرو للأدوات الصحية</h1>
            <p className="text-base text-gray-700 mb-3">سوهاج - دار السلام - نجوع مازن شرق</p>
            <div className="flex justify-center gap-6 mt-3">
              <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">01225680001</p>
              <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">01011085134</p>
            </div>
          </div>
          <CardTitle className="flex items-center gap-2 justify-between text-white">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-white" />
              إنشاء فاتورة جديدة
            </div>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-blue-600">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-100">
            إنشاء فاتورة مبيعات جديدة - رقم الفاتورة: <span className="font-semibold text-white">{invoiceNumber}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customer" className="text-gray-700 font-medium">اسم العميل</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">رقم الهاتف</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="أدخل رقم الهاتف"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-gray-700 font-medium">العنوان</Label>
              <Input
                id="address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="أدخل العنوان"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product" className="text-gray-700 font-medium">اسم المنتج</Label>
                <Input
                  id="product"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="أدخل اسم المنتج"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="text-gray-700 font-medium">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="الكمية"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-gray-700 font-medium">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="السعر"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-status" className="text-gray-700 font-medium">حالة الدفع</Label>
                <Select value={paymentStatus} onValueChange={(value: 'paid' | 'partial' | 'pending') => setPaymentStatus(value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">تم الدفع</SelectItem>
                    <SelectItem value="partial">دفع جزئي</SelectItem>
                    <SelectItem value="pending">مؤجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة منتج
                </Button>
              </div>
            </div>

            {paymentStatus === 'partial' && (
              <div className="grid gap-2 mt-4">
                <Label htmlFor="paid-amount" className="text-gray-700 font-medium">المبلغ المدفوع</Label>
                <Input
                  id="paid-amount"
                  type="number"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="أدخل المبلغ المدفوع"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
            )}
          </div>

          {invoiceItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-800 bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg shadow-sm">منتجات الفاتورة</h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden shadow-lg bg-white">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-blue-500 to-indigo-500">
                    <TableRow>
                      <TableHead className="text-right font-semibold text-white">اسم المنتج</TableHead>
                      <TableHead className="text-right font-semibold text-white">الكمية</TableHead>
                      <TableHead className="text-right font-semibold text-white">السعر</TableHead>
                      <TableHead className="text-right font-semibold text-white">الإجمالي</TableHead>
                      <TableHead className="text-right font-semibold text-white">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-green-600 font-medium">{item.price.toFixed(2)} جنيه</TableCell>
                        <TableCell className="text-green-600 font-semibold">{item.total.toFixed(2)} جنيه</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="bg-red-500 hover:bg-red-600 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center bg-gradient-to-r from-white to-blue-50 p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="space-y-2">
                  <div className="text-xl font-bold text-blue-800">
                    الإجمالي: {totalAmount.toFixed(2)} جنيه
                  </div>
                  {paymentStatus === 'partial' && paidAmount && (
                    <>
                      <div className="text-sm text-green-600 font-medium">
                        المبلغ المدفوع: {parseFloat(paidAmount).toFixed(2)} جنيه
                      </div>
                      <div className="text-sm text-red-600 font-medium">
                        المبلغ المتبقي: {(totalAmount - parseFloat(paidAmount)).toFixed(2)} جنيه
                      </div>
                    </>
                  )}
                  {paymentStatus === 'pending' && (
                    <div className="text-sm text-red-600 font-medium">
                      المبلغ المؤجل: {totalAmount.toFixed(2)} جنيه
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleArchiveInvoice} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 shadow-lg">
                    <Archive className="w-4 h-4" />
                    أرشيف الفاتورة
                  </Button>
                  <Button onClick={handleSaveInvoice} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 shadow-lg">
                    <Save className="w-4 h-4" />
                    حفظ الفاتورة
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceGeneration;
