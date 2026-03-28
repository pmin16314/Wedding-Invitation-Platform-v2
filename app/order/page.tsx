import type { Metadata } from "next";
import OrderForm from "./OrderForm";
import "../../app/home.css";

export const metadata: Metadata = { title: "Get Your Invitation — Vowly Invites" };

export default function OrderPage() {
  return <OrderForm />;
}
