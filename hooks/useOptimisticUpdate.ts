import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();

  const updateOrderStatus = useCallback((
    orderId: string,
    newStatus: string,
    userId?: string
  ) => {
    // Optimistically update the order status
    queryClient.setQueryData(['order', orderId], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        delivery: {
          ...oldData.delivery,
          delivery_status: newStatus
        }
      };
    });

    // Also update the orders list
    queryClient.setQueryData(['orders', userId], (oldData: any[]) => {
      if (!oldData) return oldData;
      return oldData.map((item: any) => 
        item.order.id === orderId 
          ? {
              ...item,
              delivery: {
                ...item.delivery,
                delivery_status: newStatus
              }
            }
          : item
      );
    });

    // Update the main orders list
    queryClient.setQueryData(['orders'], (oldData: any[]) => {
      if (!oldData) return oldData;
      return oldData.map((item: any) => 
        item.order.id === orderId 
          ? {
              ...item,
              delivery: {
                ...item.delivery,
                delivery_status: newStatus
              }
            }
          : item
      );
    });
  }, [queryClient]);

  const revertOptimisticUpdate = useCallback((
    orderId: string,
    userId?: string
  ) => {
    // Revert by invalidating queries
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);

  return { updateOrderStatus, revertOptimisticUpdate };
};
