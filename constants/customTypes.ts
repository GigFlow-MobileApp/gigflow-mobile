import { iconMap } from "@/components/ui/IconSymbol";
import { z } from 'zod';

export type DrawerItemsType = {
  label: string;
  icon: keyof typeof iconMap;
  route: string;
  onPress?: () => void;
  rotate?: boolean;
};
export type TabItemsType = {
  label: string;
  icon: keyof typeof iconMap;
  route: string;
};
export type SidebarProps = {
  items: DrawerItemsType[];
};
export type TabProps = {
  items: TabItemsType[];
};
export interface Activity {
  title: string;
  subtitle: string;
  amount: string;
  type: "in" | "out";
}
export const updateMyInfoZod = z.object({
  full_name: z.string().nullable(),
  email: z.string().email(),
  recipient_name: z.string(),
  street: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipcode: z.string().nullable(),
});
export const SignupResponseSchema = z.object({
  email: z.string().email(),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
  full_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  recipient_name: z.string().nullable(),
  street: z.string().nullable(),
  country: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipcode: z.string().nullable(),
  balance: z.number(),
  preference: z.number(),
  badge: z.number().nullable(),
  account_ubereid: z.string().nullable().optional(),
  account_lyftid: z.string().nullable().optional(),
  account_doordashid: z.string().nullable().optional(),
  account_upworkid: z.string().nullable().optional(),
  account_fiverrid: z.string().nullable().optional(),
  id: z.string().uuid(),
});

export type UpdateMyInfoType = z.infer<typeof updateMyInfoZod>;
export type SignupResponse = z.infer<typeof SignupResponseSchema>;