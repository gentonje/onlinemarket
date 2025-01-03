import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { PlusCircle, Settings, Trash2, DollarSign, Edit } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            <span className="text-vivo-orange">Vivo</span>
            <span className="text-navy-blue">Shop</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-48">
                    <Link
                      to="/add-product"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      <PlusCircle className="mr-2 h-4 w-4 inline-block" />
                      Add Product
                    </Link>
                    <Link
                      to="/delete-products"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      <Trash2 className="mr-2 h-4 w-4 inline-block" />
                      Delete Products
                    </Link>
                    <Link
                      to="/edit-product"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      <Edit className="mr-2 h-4 w-4 inline-block" />
                      Edit Products
                    </Link>
                    <Link
                      to="/revenue"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      <DollarSign className="mr-2 h-4 w-4 inline-block" />
                      Revenue
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
};

export const BottomNavigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-sm border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-2 h-16">
        <Link to="/" className="flex items-center justify-center">
          <Button variant="ghost" size="sm">
            Home
          </Button>
        </Link>
        <Link to="/add-product" className="flex items-center justify-center">
          <Button variant="ghost" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
    </div>
  );
};