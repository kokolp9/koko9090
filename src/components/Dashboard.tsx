
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Package, ShoppingCart, FileText, RotateCcw, Users, Clock, BarChart3, Archive } from 'lucide-react';
import InventoryManagement from './InventoryManagement';
import DailySales from './DailySales';
import InvoiceGeneration from './InvoiceGeneration';
import SalesReturns from './SalesReturns';
import InvoiceReturns from './InvoiceReturns';
import FawrySales from './FawrySales';
import CreditSales from './CreditSales';
import RecordsSection from './RecordsSection';
import Reports from './Reports';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">نظام إدارة المخزون - كايرو</h1>
          <Button onClick={onLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 lg:w-fit lg:grid-cols-9">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              المخزون
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              المبيعات
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الفواتير
            </TabsTrigger>
            <TabsTrigger value="sales-returns" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              مرتجع المبيعات
            </TabsTrigger>
            <TabsTrigger value="invoice-returns" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              مرتجع الفواتير
            </TabsTrigger>
            <TabsTrigger value="fawry" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              فوري
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              المؤجل
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              السجلات
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="sales">
            <DailySales />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceGeneration />
          </TabsContent>

          <TabsContent value="sales-returns">
            <SalesReturns />
          </TabsContent>

          <TabsContent value="invoice-returns">
            <InvoiceReturns />
          </TabsContent>

          <TabsContent value="fawry">
            <FawrySales />
          </TabsContent>

          <TabsContent value="credit">
            <CreditSales />
          </TabsContent>

          <TabsContent value="records">
            <RecordsSection />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
