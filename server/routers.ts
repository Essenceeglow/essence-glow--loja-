import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { categories, products, productVariants, orders, orderItems, userAddresses, productReviews } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { COOKIE_NAME } from "../shared/const";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  products: router({
    getCategories: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db.select().from(categories);
        return result;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    }),

    getAll: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db.select().from(products);
        return result;
      } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
      }
    }),

    getFeatured: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db
          .select()
          .from(products)
          .where(eq(products.featured, 1))
          .limit(8);
        return result;
      } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
      }
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        try {
          const result = await db
            .select()
            .from(products)
            .where(eq(products.id, input.id))
            .limit(1);
          if (!result.length) return null;
          return result[0];
        } catch (error) {
          console.error("Error fetching product:", error);
          return null;
        }
      }),

    // Admin procedures
    adminGetAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db.select().from(products);
        return result;
      } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
      }
    }),

    adminCreate: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.string(),
        originalPrice: z.string().optional(),
        images: z.array(z.string()).default([]),
        rating: z.string().default('0'),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          // Todo produto novo recebe uma avaliação inicial entre 4.5 e 5.0
          const defaultRating = (4.5 + Math.random() * 0.5).toFixed(1);
          const rating = input.rating && input.rating !== '0' ? input.rating : defaultRating;

          const result = await db.insert(products).values({
            categoryId: input.categoryId,
            name: input.name,
            slug: input.slug,
            description: input.description,
            price: input.price as any,
            originalPrice: input.originalPrice as any,
            images: input.images,
            rating: rating as any,
          });
          return { success: true };
        } catch (error) {
          console.error("Error creating product:", error);
          throw error;
        }
      }),

    adminUpdate: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        images: z.array(z.string()).optional(),
        rating: z.string().optional(),
        featured: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          const updateData: any = {};
          if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
          if (input.name !== undefined) updateData.name = input.name;
          if (input.description !== undefined) updateData.description = input.description;
          if (input.price !== undefined) updateData.price = input.price;
          if (input.originalPrice !== undefined) updateData.originalPrice = input.originalPrice;
          if (input.images !== undefined) updateData.images = input.images;
          if (input.rating !== undefined) updateData.rating = input.rating;
          if (input.featured !== undefined) updateData.featured = input.featured;

          await db.update(products).set(updateData).where(eq(products.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error updating product:", error);
          throw error;
        }
      }),

    adminDelete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.delete(products).where(eq(products.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error deleting product:", error);
          throw error;
        }
      }),
  }),

  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db
          .select()
          .from(userAddresses)
          .where(eq(userAddresses.userId, ctx.user.id));
        return result;
      } catch (error) {
        console.error("Error fetching addresses:", error);
        return [];
      }
    }),

    create: protectedProcedure
      .input(z.object({
        fullName: z.string(),
        phone: z.string(),
        cep: z.string(),
        street: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        city: z.string(),
        state: z.string(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.insert(userAddresses).values({
            userId: ctx.user.id,
            fullName: input.fullName,
            phone: input.phone,
            cep: input.cep,
            street: input.street,
            number: input.number,
            complement: input.complement,
            city: input.city,
            state: input.state,
            isDefault: input.isDefault ? 1 : 0,
          });
          return { success: true };
        } catch (error) {
          console.error("Error creating address:", error);
          throw error;
        }
      }),
  }),

  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db
          .select()
          .from(orders)
          .where(eq(orders.userId, ctx.user.id))
          .orderBy(desc(orders.createdAt));
        return result;
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    }),

    create: protectedProcedure
      .input(z.object({
        addressId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.number(),
        })),
        totalAmount: z.number(),
        shippingCost: z.number(),
        paymentMethod: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          
          const [insertedOrder] = await db.insert(orders).values({
            userId: ctx.user.id,
            orderNumber: orderNumber,
            addressId: input.addressId,
            totalAmount: input.totalAmount as any,
            shippingCost: input.shippingCost as any,
            paymentMethod: input.paymentMethod,
            status: 'pending',
          }).returning({ id: orders.id });

          const orderId = insertedOrder.id;
          
          for (const item of input.items) {
            await db.insert(orderItems).values({
              orderId: orderId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price as any,
            });
          }

          return { success: true, orderId, orderNumber };
        } catch (error) {
          console.error("Error creating order:", error);
          throw error;
        }
      }),
  }),

  variants: router({
    adminGetByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) return [];
        try {
          const result = await db.select().from(productVariants).where(eq(productVariants.productId, input.productId));
          return result;
        } catch (error) {
          console.error("Error fetching variants:", error);
          return [];
        }
      }),

    adminCreate: protectedProcedure
      .input(z.object({
        productId: z.number(),
        size: z.string().optional(),
        color: z.string().optional(),
        sku: z.string().optional(),
        stock: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.insert(productVariants).values({
            productId: input.productId,
            size: input.size,
            color: input.color,
            sku: input.sku,
            stock: input.stock,
          });
          return { success: true };
        } catch (error) {
          console.error("Error creating variant:", error);
          throw error;
        }
      }),

    adminUpdateStock: protectedProcedure
      .input(z.object({ id: z.number(), stock: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.update(productVariants).set({ stock: input.stock }).where(eq(productVariants.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error updating stock:", error);
          throw error;
        }
      }),

    adminDelete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.delete(productVariants).where(eq(productVariants.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error deleting variant:", error);
          throw error;
        }
      }),
  }),

  reviews: router({
    adminGetByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) return [];
        try {
          const result = await db.select().from(productReviews).where(eq(productReviews.productId, input.productId));
          return result;
        } catch (error) {
          console.error("Error fetching reviews:", error);
          return [];
        }
      }),

    adminCreate: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.insert(productReviews).values({
            productId: input.productId,
            userId: ctx.user.id,
            rating: input.rating,
            title: input.title,
            comment: input.comment,
          });
          return { success: true };
        } catch (error) {
          console.error("Error creating review:", error);
          throw error;
        }
      }),

    adminDelete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.delete(productReviews).where(eq(productReviews.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error deleting review:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
