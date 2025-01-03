import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductModifyCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
  onDelete: (productId: string) => Promise<void>;
}

export const ProductModifyCard = ({ product, onDelete }: ProductModifyCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">${product.price}</span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/edit-product/${product.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this product? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => await onDelete(product.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};