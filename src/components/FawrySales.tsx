
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Users } from 'lucide-react';

interface FawryItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface FawrySale {
  id: string;
  customerName: string;
  itemType: string;
  paymentStatus: string;
  amountPaid: number;
  remainingAmount: number;
  items: FawryItem[];
  total: number;
  date: string;
}

const FawrySales = () => {
  const [customerName, setCustomerName] = useState('');
  const [itemType, setItemType] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [currentItems, setCurrentItems] = useState<FawryItem[]>([]);
  const { toast } = useToast();

  const handleAddItem = () => {
    if (!productName || !quantity || !price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const newItem: FawryItem = {
      id: Date.now().toString(),
      productName,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      total: parseInt(quantity) * parseFloat(price)
    };

    setCurrentItems([...currentItems, newItem]);
    setProductName('');
    setQuantity('');
    setPrice('');
    
    toast({
      title: "تم إضافة المنتج",
      description: "تم إضافة المنتج إلى قائمة المبيعات",
    });
  };

  const handleRemoveItem = (id: string) => {
    setCurrentItems(currentItems.filter(item => item.id !== id));
  };

  const handleSaveSale = () => {
    if (!customerName || !itemType || !paymentStatus || !amountPaid || currentItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = currentItems.reduce((sum, item) => sum + item.total, 0);
    const paidAmount = parseFloat(amountPaid);
    const remaining = parseFloat(remainingAmount) || (totalAmount - paidAmount);

    const newSale: FawrySale = {
      id: Date.now().toString(),
      customerName,
      itemType,
      paymentStatus,
      amountPaid: paidAmount,
      remainingAmount: remaining,
      items: currentItems,
      total: totalAmount,
      date: new Date().toLocaleDateString('ar-EG')
    };

    const savedSales = localStorage.getItem('kairo_fawry_sales');
    const sales = savedSales ? JSON.parse(savedSales) : [];
    sales.push(newSale);
    localStorage.setItem('kairo_fawry_sales', JSON.stringify(sales));

    // Reset form
    setCustomerName('');
    setItemType('');
    setPaymentStatus('');
    setAmountPaid('');
    setRemainingAmount('');
    setCurrentItems([]);
    
    toast({
      title: "تم حفظ المبيعات",
      description: "تم حفظ مبيعات فوري بنجاح",
    });
  };

  const totalAmount = currentItems.reduce((sum) => sum + (sum), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            مبيعات فوري
          </CardTitle>
          <CardDescription>
            تسجيل مبيعات ماكينة فوري للدفع الإلكتروني
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">اسم العميل</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسم العميل"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="item-type">نوع الصنف</Label>
                <Select value={itemType} onValueChange={setItemType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الصنف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">كارت</SelectItem>
                    <SelectItem value="transfer">تحويل</SelectItem>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="payment-status">حالة الدفع</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">تم الدفع</SelectItem>
                    <SelectItem value="partial">دفع جزئي</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                  </SelectContent>
                </Select>
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
              
              <div className="grid gap-2">
                <Label htmlFor="remaining-amount">المبلغ المتبقي</Label>
                <Input
                  id="remaining-amount"
                  type="number"
                  step="0.01"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(e.target.value)}
                  placeholder="المبلغ المتبقي"
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

          {currentItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">منتجات البيع</h3>
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
                    {currentItems.map((item) => (
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
                  الإجمالي: {currentItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)} جنيه
                </div>
                <Button onClick={handleSaveSale} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  حفظ المبيعات
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FawrySales;
