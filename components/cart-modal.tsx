"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus, Trash2, MapPin, Phone, User, CreditCard, MessageSquare, Package, Clock, CheckCircle } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderByPharmacy {
  pharmacy: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    product: any;
    quantity: number;
    subtotal: number;
  }>;
  total: number;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, updateCartQuantity, removeFromCart, clearCart, allProducts, addToOrderHistory } = useAppStore();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    district: "San Isidro",
  });
  const [activeTab, setActiveTab] = useState("cart");

  // Agrupar productos por farmacia
  const ordersByPharmacy: OrderByPharmacy[] = cart.reduce((acc: OrderByPharmacy[], item) => {
    // Encontrar el producto completo usando productId
    const product = allProducts.find(p => p.id === item.productId);
    if (!product) {
      console.warn(`Producto con ID ${item.productId} no encontrado`);
      return acc;
    }

    const pharmacyId = item.pharmacyId;
    let pharmacyOrder = acc.find(order => order.pharmacy.id === pharmacyId);
    
    if (!pharmacyOrder) {
      pharmacyOrder = {
        pharmacy: {
          id: product.pharmacy.id,
          name: product.pharmacy.name,
          phone: product.pharmacy.phone,
          address: product.pharmacy.address,
        },
        items: [],
        total: 0,
      };
      acc.push(pharmacyOrder);
    }
    
    const subtotal = product.price * item.quantity;
    pharmacyOrder.items.push({
      product: product,
      quantity: item.quantity,
      subtotal,
    });
    pharmacyOrder.total += subtotal;
    
    return acc;
  }, []);

  const totalGeneral = ordersByPharmacy.reduce((sum, order) => sum + order.total, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const generateWhatsAppMessage = (order: OrderByPharmacy) => {
    let message = `🏥 *Pedido para ${order.pharmacy.name}*\n\n`;
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
    message += `📱 *Teléfono:* ${customerInfo.phone}\n`;
    message += `📍 *Dirección:* ${customerInfo.address}, ${customerInfo.district}\n\n`;
    message += `🛒 *Productos solicitados:*\n`;
    
    order.items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio unitario: S/ ${item.product.price.toFixed(2)}\n`;
      message += `   • Subtotal: S/ ${item.subtotal.toFixed(2)}\n\n`;
    });
    
    message += `💰 *Total del pedido: S/ ${order.total.toFixed(2)}*\n\n`;
    message += `📋 *Nota:* Por favor confirmen disponibilidad y tiempo de entrega. ¡Gracias!`;
    
    return encodeURIComponent(message);
  };

  const handleSendWhatsAppOrder = (order: OrderByPharmacy) => {
    const message = generateWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/51${order.pharmacy.phone.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendAllOrders = () => {
    // Guardar cada pedido en el historial
    ordersByPharmacy.forEach(order => {
      // Agregar al historial de pedidos
      addToOrderHistory({
        items: order.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          pharmacyId: order.pharmacy.id,
          price: item.product.price
        })),
        total: order.total,
        status: 'pending',
        pharmacyName: order.pharmacy.name
      });

      // Enviar por WhatsApp con delay
      setTimeout(() => {
        handleSendWhatsAppOrder(order);
      }, 1000); // Delay entre ventanas para no bloquear el navegador
    });
    
    // Limpiar carrito después de enviar
    clearCart();
    setActiveTab("success");
  };

  const isFormValid = customerInfo.name && customerInfo.phone && customerInfo.address;

  if (cart.length === 0 && activeTab !== "success") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito de Compras
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-4">
              Agrega algunos medicamentos para continuar con tu pedido
            </p>
            <Button onClick={onClose}>Seguir comprando</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
            {totalItems > 0 && (
              <Badge className="bg-[#0ec1ac] text-white">
                {totalItems} productos
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cart">Carrito</TabsTrigger>
            <TabsTrigger value="checkout" disabled={cart.length === 0}>
              Datos de entrega
            </TabsTrigger>
            <TabsTrigger value="success" disabled={true}>
              Confirmación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart" className="space-y-4">
            <div className="space-y-4">
              {ordersByPharmacy.map((order) => (
                <Card 
                  key={order.pharmacy.id}
                  className="bg-white/70 backdrop-blur-lg border border-white/20 hover:border-white/30 hover:bg-white/80 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#db1a85]" />
                      {order.pharmacy.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{order.pharmacy.address}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.product.presentation} • {item.product.laboratory}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium text-[#db1a85]">
                              S/ {item.product.price.toFixed(2)}
                            </span>
                            {item.product.isGeneric && (
                              <Badge variant="secondary" className="text-xs">
                                Genérico
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeFromCart(item.product.id, order.pharmacy.id);
                              } else {
                                updateCartQuantity(item.product.id, order.pharmacy.id, item.quantity - 1);
                              }
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.product.id, order.pharmacy.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id, order.pharmacy.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">S/ {item.subtotal.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-medium">Subtotal {order.pharmacy.name}:</span>
                      <span className="font-bold text-lg text-[#db1a85]">
                        S/ {order.total.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card 
                className="border-[#db1a85]/20 bg-white/70 backdrop-blur-lg hover:bg-white/80 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total General:</span>
                    <span className="text-2xl font-bold text-[#db1a85]">
                      S/ {totalGeneral.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ordersByPharmacy.length} farmacia{ordersByPharmacy.length > 1 ? 's' : ''} • {totalItems} productos
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="flex-1"
                >
                  Vaciar carrito
                </Button>
                <Button 
                  onClick={() => setActiveTab("checkout")}
                  className="flex-1 bg-linear-to-r from-[#db1a85] to-[#0ec1ac] hover:from-[#db1a85]/90 hover:to-[#0ec1ac]/90 text-white"
                >
                  Continuar con el pedido
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checkout" className="space-y-4">
            <Card
              className="bg-white/70 backdrop-blur-lg border border-white/20 hover:border-white/30 hover:bg-white/80 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nombre completo *</label>
                    <Input
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Teléfono *</label>
                    <Input
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="999 999 999"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Dirección de entrega *</label>
                  <Input
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Av. Ejemplo 123, Dpto. 456"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Distrito</label>
                  <Input
                    value={customerInfo.district}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="San Isidro"
                  />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-[#0ec1ac]/20 bg-white/70 backdrop-blur-lg hover:bg-white/80 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#0ec1ac]" />
                  Método de Pedido - WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Tu pedido será enviado por WhatsApp a cada farmacia por separado para que confirmen 
                    disponibilidad y coordinen la entrega.
                  </p>
                  
                  <div className="space-y-2">
                    {ordersByPharmacy.map((order) => (
                      <div key={order.pharmacy.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="font-medium">{order.pharmacy.name}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{order.pharmacy.phone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">S/ {order.total.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.items.length} producto{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("cart")}
                className="flex-1"
              >
                Volver al carrito
              </Button>
              <Button 
                onClick={handleSendAllOrders}
                disabled={!isFormValid}
                className="flex-1 bg-linear-to-r from-[#db1a85] to-[#0ec1ac] hover:from-[#db1a85]/90 hover:to-[#0ec1ac]/90 text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar pedidos por WhatsApp
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="success" className="space-y-4">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">¡Pedidos enviados exitosamente!</h3>
              <p className="text-muted-foreground mb-6">
                Hemos enviado tu pedido a {ordersByPharmacy.length} farmacia{ordersByPharmacy.length > 1 ? 's' : ''} por WhatsApp. 
                Pronto se pondrán en contacto contigo para confirmar disponibilidad y coordinar la entrega.
              </p>
              
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Resumen del pedido:</h4>
                {ordersByPharmacy.map((order) => (
                  <div key={order.pharmacy.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>{order.pharmacy.name}</span>
                    <span className="font-medium">S/ {order.total.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-[#db1a85]">S/ {totalGeneral.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    clearCart();
                    onClose();
                  }}
                  className="flex-1"
                >
                  Continuar comprando
                </Button>
                <Button 
                  onClick={onClose}
                  className="flex-1 bg-linear-to-r from-[#db1a85] to-[#0ec1ac] text-white"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
