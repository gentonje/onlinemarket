import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ProductFilters } from "@/components/ProductFilters";
import { Star } from "lucide-react";

interface Profile {
  id: string;
  user_type: string;
  contact_email?: string | null;
  full_name?: string | null;
}

const AdminManagement = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      try {
        console.log("Fetching profiles...");
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`
            id,
            user_type,
            full_name,
            contact_email
          `);

        if (error) {
          console.error("Error fetching profiles:", error);
          toast.error("Failed to fetch profiles");
          throw error;
        }

        console.log("Fetched profiles:", profiles);
        return profiles as Profile[];
      } catch (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
    }
  });

  const handleToggleAdmin = async (userId: string, shouldBeAdmin: boolean) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase.rpc('manage_admin_user', {
        target_user_id: userId,
        should_be_admin: shouldBeAdmin
      });

      if (error) {
        console.error('Error updating admin status:', error);
        throw error;
      }

      await refetch();
      toast.success(`User ${shouldBeAdmin ? 'promoted to' : 'demoted from'} admin successfully`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProfiles = profiles?.filter((profile) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(searchLower) ||
      profile.contact_email?.toLowerCase().includes(searchLower)
    );
  });

  // Sort profiles: admins first, then other users
  const sortedProfiles = filteredProfiles?.sort((a, b) => {
    if (a.user_type === 'admin' && b.user_type !== 'admin') return -1;
    if (a.user_type !== 'admin' && b.user_type === 'admin') return 1;
    return 0;
  });

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  // Separate admins and regular users
  const adminProfiles = sortedProfiles?.filter(profile => profile.user_type === 'admin');
  const regularProfiles = sortedProfiles?.filter(profile => profile.user_type !== 'admin');

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4 mt-10">Admin Management</h1>
      <ProductFilters onSearchChange={setSearchQuery} />
      
      {/* Admin Section */}
      {adminProfiles && adminProfiles.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Administrators</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminProfiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      {profile.full_name || 'N/A'}
                      <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.contact_email || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-medium">Role</div>
                    <div className="text-sm text-muted-foreground">
                      {profile.user_type || 'user'}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => handleToggleAdmin(profile.id, profile.user_type !== 'admin')}
                    disabled={isUpdating || profile.user_type === 'super_admin'}
                  >
                    {profile.user_type === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Regular Users Section */}
      {regularProfiles && regularProfiles.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Users</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularProfiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {profile.full_name || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.contact_email || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-medium">Role</div>
                    <div className="text-sm text-muted-foreground">
                      {profile.user_type || 'user'}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => handleToggleAdmin(profile.id, profile.user_type !== 'admin')}
                    disabled={isUpdating || profile.user_type === 'super_admin'}
                  >
                    {profile.user_type === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminManagement;