import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Auction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, CircleDollarSign, Truck, MapPin } from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";

interface PaymentModalProps {
  auction: Auction;
  onClose: () => void;
}

export default function PaymentModal({ auction, onClose }: PaymentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("shipping");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Shipping address form state
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.fullName || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phoneNumber: "",
    saveAddress: false
  });
  
  // Credit card form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: user?.fullName || "",
    expiryDate: "",
    cvv: "",
    saveCard: false
  });

  // Format currency (Indian Rupees)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0, // No decimal points for INR
    }).format(amount);
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleShippingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setShippingDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "Payment Successful",
        description: `Your payment of ${formatCurrency(auction.currentPrice)} has been processed successfully.`,
      });
      
      onClose();
    }, 2000);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Auction #{auction.id}: {auction.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-neutral-50 p-4 rounded-md my-4">
          <div className="flex justify-between mb-2">
            <span className="text-neutral-600">Item:</span>
            <span className="font-semibold">{auction.title}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-neutral-600">Winning bid:</span>
            <span className="font-semibold">{formatCurrency(auction.currentPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Total payment:</span>
            <span className="font-semibold text-primary">{formatCurrency(auction.currentPrice)}</span>
          </div>
        </div>
        
        <Tabs defaultValue="shipping" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shipping" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
          </TabsList>
          
          {/* Shipping Address Tab */}
          <TabsContent value="shipping" className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={shippingDetails.fullName}
                onChange={handleShippingInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                placeholder="Street address, P.O. box, company name"
                value={shippingDetails.addressLine1}
                onChange={handleShippingInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={shippingDetails.addressLine2}
                onChange={handleShippingInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  value={shippingDetails.city}
                  onChange={handleShippingInputChange}
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  value={shippingDetails.state}
                  onChange={handleShippingInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="110001"
                  value={shippingDetails.pincode}
                  onChange={handleShippingInputChange}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={shippingDetails.country}
                  onChange={handleShippingInputChange}
                  disabled
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+91 98765 43210"
                value={shippingDetails.phoneNumber}
                onChange={handleShippingInputChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveAddress"
                name="saveAddress"
                checked={shippingDetails.saveAddress}
                onCheckedChange={(checked) => 
                  setShippingDetails(prev => ({ ...prev, saveAddress: checked === true }))
                }
              />
              <Label htmlFor="saveAddress" className="text-sm">Save address for future purchases</Label>
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={() => setActiveTab("payment")}
              >
                Continue to Payment
              </Button>
            </div>
          </TabsContent>
          
          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card className="border-none shadow-none">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="credit-card" onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                  </TabsList>
                  
                  {/* Credit Card Form */}
                  <TabsContent value="credit-card" className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={handleCardInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardHolder">Card Holder Name</Label>
                      <Input
                        id="cardHolder"
                        name="cardHolder"
                        placeholder="John Doe"
                        value={cardDetails.cardHolder}
                        onChange={handleCardInputChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={handleCardInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          maxLength={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveCard"
                        name="saveCard"
                        checked={cardDetails.saveCard}
                        onCheckedChange={(checked) => 
                          setCardDetails(prev => ({ ...prev, saveCard: checked === true }))
                        }
                      />
                      <Label htmlFor="saveCard" className="text-sm">Save card for future payments</Label>
                    </div>
                  </TabsContent>
                  
                  {/* PayPal Form */}
                  <TabsContent value="paypal">
                    <div className="py-8 text-center">
                      <div className="flex justify-center mb-4">
                        <CircleDollarSign className="h-12 w-12 text-blue-600" />
                      </div>
                      <p className="text-neutral-600 mb-4">
                        You will be redirected to PayPal to complete your payment of {formatCurrency(auction.currentPrice)}.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("shipping")}
                className="flex-1"
              >
                Back to Shipping
              </Button>
              <Button
                type="button"
                className="flex-1 gap-2"
                onClick={handleProcessPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
                {isProcessing ? "Processing..." : "Complete Purchase"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="text-neutral-500 hover:text-neutral-700"
          >
            Cancel Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
