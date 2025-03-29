import { useLocation } from "wouter";

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

  // Map icon names to lucide-react icon classes
  const getIconClass = () => {
    switch (icon) {
      case "laptop": return "fas fa-laptop";
      case "shirt": return "fas fa-tshirt";
      case "gem": return "fas fa-gem";
      case "sofa": return "fas fa-couch";
      case "palette": return "fas fa-palette";
      case "car": return "fas fa-car";
      default: return "fas fa-box";
    }
  };

  return (
    <a 
      href="#" 
      className="group"
      onClick={handleClick}
    >
      <div className="bg-neutral-50 rounded-lg p-4 text-center hover:bg-primary hover:bg-opacity-5 transition-colors">
        <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className={`${getIconClass()} text-primary text-lg`}></i>
        </div>
        <h3 className="font-medium group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-neutral-600 text-sm mt-1">{itemCount} items</p>
      </div>
    </a>
  );
}
