import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, FileText } from 'lucide-react';

interface ReturnItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceReturn {
  id: string;
  customerName: string;
  invoiceNumber?: string;
  items: ReturnItem[];
  total: number;
  date: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  items: any[];
  total: number;
  returnAmount?: number;
}

const InvoiceReturns = () => {
  const [customerName, setCustomerName] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [currentReturnItems, setCurrentReturnItems] = useState<ReturnItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('kairo_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    const savedInvoices = localStorage.getItem('kairo_invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  const handleInvoiceSelect = (invoiceNumber: string) => {
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    if (invoice) {
      setCustomerName(invoice.customerName);
    }
    setSelectedInvoice(invoiceNumber);
  };

  const handleAddItem = () => {
    if (!productName || !quantity || !price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const newItem: ReturnItem = {
      id: Date.now().toString(),
      productName,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      total: parseInt(quantity) * parseFloat(price)
    };

    setCurrentReturnItems([...currentReturnItems, newItem]);
    setProductName('');
    setQuantity('');
    setPrice('');
    
    toast({
      title: "تم إضافة المنتج",
      description: "تم إضافة المنتج إلى قائمة المرتجعات",
    });
  };

  const handleRemoveItem = (id: string) => {
    setCurrentReturnItems(currentReturnItems.filter(item => item.id !== id));
  };

  const handleSaveReturn = () => {
    if (!customerName || currentReturnItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل وإضافة منتجات",
        variant: "destructive",
      });
      return;
    }

    // Add items back to inventory
    const updatedProducts = [...products];
    
    for (const item of currentReturnItems) {
      const productIndex = updatedProducts.findIndex(p => p.name === item.productName);
      if (productIndex !== -1) {
        updatedProducts[productIndex].quantity += item.quantity;
      } else {
        // If product doesn't exist, create it
        updatedProducts.push({
          id: Date.now().toString(),
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          date: new Date().toLocaleDateString('ar-EG')
        });
      }
    }

    // Save return to records
    const newReturn: InvoiceReturn = {
      id: Date.now().toString(),
      customerName,
      invoiceNumber: selectedInvoice || undefined,
      items: currentReturnItems,
      total: currentReturnItems.reduce((sum, item) => sum + item.total, 0),
      date: new Date().toLocaleDateString('ar-EG')
    };

    const savedReturns = localStorage.getItem('kairo_invoice_returns');
    const returns = savedReturns ? JSON.parse(savedReturns) : [];
    returns.push(newReturn);
    localStorage.setItem('kairo_invoice_returns', JSON.stringify(returns));

    // Update inventory
    localStorage.setItem('kairo_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // If linked to an invoice, update the invoice with return information
    if (selectedInvoice) {
      const updatedInvoices = invoices.map(invoice => {
        if (invoice.invoiceNumber === selectedInvoice) {
          return {
            ...invoice,
            returnAmount: (invoice.returnAmount || 0) + newReturn.total,
            hasReturn: true
          };
        }
        return invoice;
      });
      localStorage.setItem('kairo_invoices', JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    }

    // Reset form
    setCustomerName('');
    setSelectedInvoice('');
    setCurrentReturnItems([]);
    
    toast({
      title: "تم حفظ المرتجع",
      description: "تم حفظ مرتجع الفواتير وتحديث المخزون بنجاح",
    });
  };

  const totalAmount = currentReturnItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            مرتجع الفواتير
          </CardTitle>
          <CardDescription>
            تسجيل مرتجعات الفواتير من العملاء
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invoice">الفاتورة (اختياري)</Label>
                <Select value={selectedInvoice} onValueChange={handleInvoiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفاتورة" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.invoiceNumber}>
                        {invoice.invoiceNumber} - {invoice.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">اسم العميل</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسم العميل"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product">اسم المنتج</Label>
                <Input
                  id="product"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="اسم المنتج"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="الكمية"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="السعر"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة منتج
                </Button>
              </div>
            </div>
          </div>

          {currentReturnItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">منتجات المرتجع</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReturnItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                        <TableCell>{item.total.toFixed(2)} جنيه</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  الإجمالي: {totalAmount.toFixed(2)} جنيه
                </div>
                <Button onClick={handleSaveReturn} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  حفظ المرتجع
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceReturns;
