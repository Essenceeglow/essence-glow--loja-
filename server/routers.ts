import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { categories, products, productVariants, orders, orderItems, userAddresses, productReviews, productBundles, bundleItems } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { COOKIE_NAME } from "../shared/const";
import { createPaymentPreference } from "./_core/mercadoPago";

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

    // Retorna as variantes (cor/sabor/nome) de UM produto, cada uma com sua
    // própria foto. Usado na página de produto para trocar a foto sem sair da página.
    getVariants: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          const result = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, input.productId));
          return result;
        } catch (error) {
          console.error("Error fetching product variants:", error);
          return [];
        }
      }),

    adminCreateVariant: protectedProcedure
      .input(z.object({
        productId: z.number(),
        label: z.string().min(1, "Dê um nome para a variante (ex: Morango, Vermelho)"),
        images: z.array(z.string()).optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          await db.insert(productVariants).values({
            productId: input.productId,
            label: input.label,
            color: input.label,
            images: (input.images ?? []).filter((url) => url.trim() !== ""),
            stock: input.stock ?? 0,
          });
          return { success: true };
        } catch (error) {
          console.error("Error creating variant:", error);
          throw error;
        }
      }),

    adminDeleteVariant: protectedProcedure
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

  bundles: router({
    // Lista pública, usada na home ("Compre o Look")
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db.select().from(productBundles);
        return result;
      } catch (error) {
        console.error("Error fetching bundles:", error);
        return [];
      }
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        try {
          const [bundle] = await db
            .select()
            .from(productBundles)
            .where(eq(productBundles.id, input.id))
            .limit(1);
          if (!bundle) return null;

          const items = await db
            .select()
            .from(bundleItems)
            .where(eq(bundleItems.bundleId, input.id));

          return { ...bundle, items };
        } catch (error) {
          console.error("Error fetching bundle:", error);
          return null;
        }
      }),

    adminGetAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) return [];
      try {
        const bundles = await db.select().from(productBundles);
        const allItems = await db.select().from(bundleItems);
        return bundles.map((bundle) => ({
          ...bundle,
          items: allItems.filter((item) => item.bundleId === bundle.id),
        }));
      } catch (error) {
        console.error("Error fetching bundles:", error);
        return [];
      }
    }),

    adminCreate: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        bundlePrice: z.string(),
        image: z.string().optional(),
        featured: z.number().optional(),
        productIds: z.array(z.object({
          productId: z.number(),
          quantity: z.number().default(1),
        })).min(1, "Selecione ao menos um produto para o bundle"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          const [bundle] = await db.insert(productBundles).values({
            name: input.name,
            description: input.description,
            bundlePrice: input.bundlePrice as any,
            image: input.image,
            featured: input.featured ?? 0,
          }).returning({ id: productBundles.id });

          for (const item of input.productIds) {
            await db.insert(bundleItems).values({
              bundleId: bundle.id,
              productId: item.productId,
              quantity: item.quantity,
            });
          }

          return { success: true, id: bundle.id };
        } catch (error) {
          console.error("Error creating bundle:", error);
          throw error;
        }
      }),

    adminUpdate: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        bundlePrice: z.string().optional(),
        image: z.string().optional(),
        featured: z.number().optional(),
        productIds: z.array(z.object({
          productId: z.number(),
          quantity: z.number().default(1),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          const updateData: any = {};
          if (input.name !== undefined) updateData.name = input.name;
          if (input.description !== undefined) updateData.description = input.description;
          if (input.bundlePrice !== undefined) updateData.bundlePrice = input.bundlePrice;
          if (input.image !== undefined) updateData.image = input.image;
          if (input.featured !== undefined) updateData.featured = input.featured;

          if (Object.keys(updateData).length > 0) {
            await db.update(productBundles).set(updateData).where(eq(productBundles.id, input.id));
          }

          if (input.productIds) {
            await db.delete(bundleItems).where(eq(bundleItems.bundleId, input.id));
            for (const item of input.productIds) {
              await db.insert(bundleItems).values({
                bundleId: input.id,
                productId: item.productId,
                quantity: item.quantity,
              });
            }
          }

          return { success: true };
        } catch (error) {
          console.error("Error updating bundle:", error);
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
          await db.delete(bundleItems).where(eq(bundleItems.bundleId, input.id));
          await db.delete(productBundles).where(eq(productBundles.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error deleting bundle:", error);
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
          const [inserted] = await db.insert(userAddresses).values({
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
          }).returning({ id: userAddresses.id });
          return { success: true, id: inserted.id };
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
          variantId: z.number().optional(),
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
              variantId: item.variantId,
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

  payments: router({
    // Cria a preferência de pagamento no Mercado Pago para um pedido já criado
    // e retorna a URL de checkout para redirecionar o cliente.
    createPreference: protectedProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        try {
          const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, input.orderId))
            .limit(1);

          if (!order || order.userId !== ctx.user.id) {
            throw new Error('Pedido não encontrado');
          }

          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, input.orderId));

          const productRows = await db.select().from(products);
          const productMap = new Map(productRows.map((p) => [p.id, p]));

          const preferenceItems = items.map((item) => ({
            id: String(item.productId),
            title: productMap.get(item.productId)?.name ?? `Produto #${item.productId}`,
            quantity: item.quantity,
            unit_price: parseFloat(item.price as any),
          }));

          const { checkoutUrl, preferenceId } = await createPaymentPreference({
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: preferenceItems,
            shippingCost: parseFloat((order.shippingCost as any) ?? '0'),
            payerEmail: ctx.user.email,
          });

          if (!checkoutUrl) {
            throw new Error('Não foi possível gerar o link de pagamento');
          }

          await db.update(orders)
            .set({ paymentMethod: 'mercadopago' })
            .where(eq(orders.id, order.id));

          return { checkoutUrl, preferenceId };
        } catch (error) {
          console.error("Error creating payment preference:", error);
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
