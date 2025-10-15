import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions - Apparel Cast</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">1. Introduction</h2>
          <p>
            Welcome to Apparel Cast. These Terms and Conditions govern your use of our website and the purchase of products
            from our online store. By accessing or using our website, you agree to be bound by these Terms and
            Conditions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">2. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>"We," "Us," "Our"</strong> refers to Apparel Cast
            </li>
            <li>
              <strong>"You," "Your"</strong> refers to the user or customer
            </li>
            <li>
              <strong>"Website"</strong> refers to apparelcast.shop
            </li>
            <li>
              <strong>"Products"</strong> refers to clothing, sneakers, and perfumes sold on our website
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">3. Account Registration</h2>
          <p>To make purchases on our website, you must create an account. You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be responsible for all activities under your account</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">4. Product Information</h2>
          <p>We strive to display our products as accurately as possible. However:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Colors may vary slightly due to screen settings</li>
            <li>Product descriptions are provided for general information</li>
            <li>We reserve the right to correct any errors in pricing or descriptions</li>
            <li>All prices are in South African Rand (ZAR) and include VAT</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">5. Orders and Payment</h2>
          <p>When you place an order:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You make an offer to purchase products at the stated price</li>
            <li>We reserve the right to accept or decline your order</li>
            <li>Payment is processed securely through Paystack</li>
            <li>Orders are confirmed once payment is successfully processed</li>
            <li>We may cancel orders if products are unavailable or pricing errors occur</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">6. Delivery</h2>
          <p>We offer delivery throughout South Africa via Courier Guy and Pudo:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Delivery times are estimates and not guaranteed</li>
            <li>Delivery fees are calculated at checkout</li>
            <li>You must provide accurate delivery information</li>
            <li>Risk of loss passes to you upon delivery</li>
            <li>We are not responsible for delays caused by courier services</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">7. Returns and Refunds</h2>
          <p>We want you to be satisfied with your purchase:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may return unworn, unwashed items within 14 days of delivery</li>
            <li>Items must be in original condition with tags attached</li>
            <li>Perfumes and intimate apparel cannot be returned for hygiene reasons</li>
            <li>Return shipping costs are the customer's responsibility</li>
            <li>Refunds are processed within 7-10 business days after receiving returned items</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">8. Intellectual Property</h2>
          <p>
            All content on our website, including images, text, logos, and designs, is owned by Apparel Cast and protected by
            copyright laws. You may not use, reproduce, or distribute any content without our written permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">9. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>Our total liability is limited to the amount you paid for the product</li>
            <li>We do not warrant that our website will be uninterrupted or error-free</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">10. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
            protect your personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately
            upon posting to the website. Your continued use of the website constitutes acceptance of the modified terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">12. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by the laws of South Africa. Any disputes shall be subject to the
            exclusive jurisdiction of the South African courts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">13. Contact Information</h2>
          <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
          <ul className="list-none space-y-2">
            <li>Email: legal@apparelcast.shop</li>
            <li>Phone: +27 63 400 9626</li>
          </ul>
        </section>
      </div>
      </div>
      <Footer />
    </>
  )
}
