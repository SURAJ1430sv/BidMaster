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
import { Loader2, CreditCard, CircleDollarSign } from "lucide-react";

interface PaymentModalProps {
  auction: Auction;
  onClose: () => void;
}

export default function PaymentModal({ auction, onClose }: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Credit card form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
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
        
        <Tabs defaultValue="credit-card" onValueChange={setPaymentMethod}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
          </TabsList>
          
          {/* Credit Card Form */}
          <TabsContent value="credit-card" className="space-y-4">
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
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="sm:w-full"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="sm:w-full gap-2"
            onClick={handleProcessPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : paymentMethod === "credit-card" ? (
              <CreditCard className="h-4 w-4" />
            ) : (
              <CircleDollarSign className="h-4 w-4" />
            )}
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
