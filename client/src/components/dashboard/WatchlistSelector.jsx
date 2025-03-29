
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStock } from '@/context/StockContext';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@/context/AuthContext"

import axios from "axios";

import { useEffect } from 'react';

const WatchlistSelector = () => {
  const { watchlists, selectedWatchlist, setSelectedWatchlist, createWatchlist, deleteWatchlist } = useStock();
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const server = `https://stock-prediction-two-roan.vercel.app/api`

  const { user } = useAuth();

  const handleCreateWatchlist = () => {
    if (newWatchlistName) {
      createWatchlist(newWatchlistName, user._id);
      setNewWatchlistName('');
      setCreateDialogOpen(false);
    }
  };

  const handleDeleteWatchlist = () => {
    if (selectedWatchlist) {
      deleteWatchlist(selectedWatchlist._id);
      setDeleteDialogOpen(false);
    }
  };

  const populateWatchlist = async (watchlistId) => {
    if (watchlistId) {
      
      try {
        
        const response = await axios.post(`${server}/watchlist/getlist`, { watchlistId: watchlistId });
        const watchlist = response.data;
        setSelectedWatchlist(watchlist);
      } catch (e) {
        console.log(e);
      }
    }
  }

  useEffect(() => {
    if (watchlists) {
       
      populateWatchlist(watchlists[0])
     }
  }, [watchlists]);


  return (
    <div className="flex items-center space-x-2">
      <div className="flex-grow">
        <Select
          value={selectedWatchlist?._id || ''}
          onValueChange={(watchlistId) => {
            if (watchlistId) {

              populateWatchlist(watchlistId)
            }

          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a watchlist" />
          </SelectTrigger>
          <SelectContent>
            {watchlists ? (
                watchlists.map((watchlist) => (
                  <SelectItem key={watchlist._id} value={watchlist._id}>
                    {watchlist.name} ({watchlist?.stocks?.length})
                  </SelectItem>
                ))
              ) : (
                <SelectItem>No Watchlists</SelectItem>
              )}

          </SelectContent>
        </Select>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Watchlist</DialogTitle>
            <DialogDescription>
              Enter a name for your new watchlist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Watchlist Name</Label>
              <Input
                id="name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="e.g., Tech Stocks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateWatchlist} disabled={!newWatchlistName}>
              Create Watchlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={!selectedWatchlist}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{selectedWatchlist?.name}" watchlist and remove all stocks from it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWatchlist}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WatchlistSelector;
