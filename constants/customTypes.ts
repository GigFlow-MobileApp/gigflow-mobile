import { iconMap } from "@/components/ui/IconSymbol";

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