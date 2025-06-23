
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Clock } from 'lucide-react';

interface CreditItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  amountPaid: number;
  remainingAmount: number;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
}

const CreditSales = () => {
  const [customerName, setCustomerName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [currentItems, setCurrentItems] = useState<CreditItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('kairo_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || !amountPaid) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.name === selectedProduct);
    if (!product) {
      toast({
        title: "خطأ",
        description: "المنتج غير موجود",
        variant: "destructive",
      });
      return;
    }

    const requestedQuantity = parseInt(quantity);
    if (requestedQuantity > product.quantity) {
      toast({
        title: "خطأ",
        description: `الكمية المطلوبة (${requestedQuantity}) أكبر من المتوفر في المخزون (${product.quantity})`,
        variant: "destructive",
      });
      return;
    }

    const totalPrice = requestedQuantity * product.price;
    const paidAmountValue = parseFloat(amountPaid);
    const remainingAmountValue = totalPrice - paidAmountValue;

    const newItem: CreditItem = {
      id: Date.now().toString(),
      productName: selectedProduct,
      quantity: requestedQuantity,
      price: product.price,
      amountPaid: paidAmountValue,
      remainingAmount: remainingAmountValue
    };

    setCurrentItems([...currentItems, newItem]);
    setSelectedProduct('');
    setQuantity('');
    setAmountPaid('');
    
    toast({
      title: "تم إضافة المنتج",
      description: "تم إضافة المنتج إلى قائمة المؤجل",
    });
  };

  const handleRemoveItem = (id: string) => {
    setCurrentItems(currentItems.filter(item => item.id !== id));
  };

  const handleSaveCreditSale = () => {
    if (!customerName || currentItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء اسم العميل وإضافة منتج واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    const totalPaid = currentItems.reduce((sum, item) => sum + item.amountPaid, 0);
    const totalRemaining = currentItems.reduce((sum, item) => sum + item.remainingAmount, 0);

    const newCreditSale = {
      id: Date.now().toString(),
      customerName,
      items: currentItems,
      totalPaid,
      totalRemaining,
      date: new Date().toLocaleDateString('ar-EG')
    };

    // Update inventory - deduct quantities
    const updatedProducts = products.map(product => {
      const creditItem = currentItems.find(item => item.productName === product.name);
      if (creditItem) {
        return {
          ...product,
          quantity: product.quantity - creditItem.quantity
        };
      }
      return product;
    });

    // Save credit sale
    const savedCreditSales = localStorage.getItem('kairo_credit_sales');
    const creditSales = savedCreditSales ? JSON.parse(savedCreditSales) : [];
    creditSales.push(newCreditSale);
    localStorage.setItem('kairo_credit_sales', JSON.stringify(creditSales));

    // Save updated products
    localStorage.setItem('kairo_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // Reset form
    setCustomerName('');
    setCurrentItems([]);
    
    toast({
      title: "تم حفظ المؤجل",
      description: "تم حفظ المبيعة المؤجلة وتحديث المخزون بنجاح",
    });
  };

  const availableProducts = products.filter(p => p.quantity > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            قسم المؤجل
          </CardTitle>
          <CardDescription>
            تسجيل المبيعات المؤجلة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">اسم العميل</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product">المنتج</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name} - متوفر: {product.quantity} - السعر: {product.price.toFixed(2)} جنيه
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="amount-paid">المبلغ المدفوع</Label>
                <Input
                  id="amount-paid"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="المبلغ المدفوع"
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

          {currentItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">منتجات المؤجل</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">السعر الوحدة</TableHead>
                      <TableHead className="text-right">السعر الإجمالي</TableHead>
                      <TableHead className="text-right">المبلغ المدفوع</TableHead>
                      <TableHead className="text-right">المبلغ الباقي</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                        <TableCell>{(item.quantity * item.price).toFixed(2)} جنيه</TableCell>
                        <TableCell>{item.amountPaid.toFixed(2)} جنيه</TableCell>
                        <TableCell>{item.remainingAmount.toFixed(2)} جنيه</TableCell>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-lg font-semibold">
                    إجمالي المدفوع: {currentItems.reduce((sum, item) => sum + item.amountPaid, 0).toFixed(2)} جنيه
                  </div>
                  <div className="text-lg font-semibold">
                    إجمالي الباقي: {currentItems.reduce((sum, item) => sum + item.remainingAmount, 0).toFixed(2)} جنيه
                  </div>
                </div>
                <Button onClick={handleSaveCreditSale} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  حفظ المؤجل
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditSales;
