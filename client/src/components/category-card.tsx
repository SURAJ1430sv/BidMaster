import { useLocation } from "wouter";
import { Laptop, ShoppingBag, Gift, Sofa, Palette, Car, Package } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: string;
  itemCount: number;
}

export default function CategoryCard({ name, icon, itemCount }: CategoryCardProps) {
  const [, navigate] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/auctions?category=${name}`);
  };

  // Map icon names to Lucide React icons
  const getIcon = () => {
    switch (icon) {
      case "laptop": return <Laptop className="h-6 w-6 text-primary" />;
      case "shirt": return <ShoppingBag className="h-6 w-6 text-primary" />;
      case "gem": return <Gift className="h-6 w-6 text-primary" />;
      case "sofa": return <Sofa className="h-6 w-6 text-primary" />;
      case "palette": return <Palette className="h-6 w-6 text-primary" />;
      case "car": return <Car className="h-6 w-6 text-primary" />;
      default: return <Package className="h-6 w-6 text-primary" />;
    }
  };

  // Get a background color based on the category name (for visual variety)
  const getBgColor = () => {
    const colors = [
      "bg-blue-50 hover:bg-blue-100",
      "bg-green-50 hover:bg-green-100",
      "bg-purple-50 hover:bg-purple-100",
      "bg-amber-50 hover:bg-amber-100",
      "bg-pink-50 hover:bg-pink-100",
      "bg-sky-50 hover:bg-sky-100"
    ];
    
    // Simple hash function to consistently get the same color for the same category
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <a 
      href="#" 
      className="group block"
      onClick={handleClick}
    >
      <div className={`rounded-lg p-5 text-center transition-all duration-200 shadow-sm hover:shadow ${getBgColor()}`}>
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          {getIcon()}
        </div>
        <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-neutral-600 text-sm mt-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>
    </a>
  );
}
