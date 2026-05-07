import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock3, ExternalLink, Globe2, Mail, MessageSquareReply } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Rating } from "@/components/Rating";
import { ReviewSummaryWithFilters } from "@/components/ReviewSummaryWithFilters";
import { getApprovedReviewsForCompany, getCompanies, getCompanyBySlug, getRatingBreakdown } from "@/lib/data";
import type { ReviewWithReply } from "@/lib/types";

type Props = { params: { slug: string } };

const baseUrl = "https://furniturebrandreviews.com";

const deliveryKeywords = ["delivery", "delivered", "shipping", "courier", "dispatch", "arrived", "late", "delay"];
const complaintKeywords = ["complaint", "problem", "issue", "damaged", "refund", "return", "late", "delay", "poor", "broken", "fault"];

function reviewText(review: ReviewWithReply) {
  return `${review.title} ${review.content}`.toLowerCase();
}

function countMentions(reviews: ReviewWithReply[], keywords: string[]) {
  return reviews.filter((review) => keywords.some((keyword) => reviewText(review).includes(keyword))).length;
}

function getCustomerThemes(reviews: ReviewWithReply[]) {
  if (reviews.length < 3) return null;

  const themes = [
    { label: "Delivery experience", count: countMentions(reviews, deliveryKeywords) },
    { label: "Product quality", count: countMentions(reviews, ["quality", "solid", "comfortable", "material", "finish", "assembly"]) },
    { label: "Customer service", count: countMentions(reviews, ["service", "support", "reply", "help", "staff", "team"]) },
    { label: "Value for money", count: countMentions(reviews, ["value", "price", "expensive", "cheap", "cost", "money"]) },
    { label: "Returns or after-sales support", count: countMentions(reviews, ["return", "refund", "after-sales", "replacement", "warranty"]) }
  ];

  return themes.map((theme) => ({
    ...theme,
    text:
      theme.count > 0
        ? `${theme.count} approved ${theme.count === 1 ? "review mentions" : "reviews mention"} ${theme.label.toLowerCase()}.`
        : `Not enough approved reviews mention ${theme.label.toLowerCase()} yet.`
  }));
}

function getDeliverySummary(companyName: string, reviews: ReviewWithReply[]) {
  const deliveryCount = countMentions(reviews, deliveryKeywords);
  if (deliveryCount === 0) {
    return `There are not enough approved ${companyName} reviews mentioning delivery to identify a clear delivery feedback pattern yet.`;
  }

  return `${deliveryCount} approved ${deliveryCount === 1 ? "review mentions" : "reviews mention"} delivery, shipping, courier timing or arrival experience for ${companyName}. Read the individual reviews for the full customer context.`;
}

function getComplaintsSummary(companyName: string, reviews: ReviewWithReply[]) {
  const complaintReviews = reviews.filter(
    (review) => review.rating <= 2 || complaintKeywords.some((keyword) => reviewText(review).includes(keyword))
  );

  if (complaintReviews.length === 0) {
    return `There are no clear approved complaint patterns for ${companyName} yet. Furniture Brand Reviews does not invent complaints where there is not enough customer feedback.`;
  }

  return `${complaintReviews.length} approved ${complaintReviews.length === 1 ? "review includes" : "reviews include"} a low rating or complaint-related wording. Check the review cards above for the exact customer comments before making a buying decision.`;
}

function buildFaq(companyName: string, reviews: ReviewWithReply[]) {
  const themes = getCustomerThemes(reviews);
  const verifiedCount = reviews.filter((review) => review.is_verified).length;

  return [
    {
      question: `Is ${companyName} a good furniture brand?`,
      answer:
        reviews.length > 0
          ? `${companyName} has ${reviews.length} approved customer ${reviews.length === 1 ? "review" : "reviews"} on Furniture Brand Reviews with an average rating based on currently published feedback.`
          : `There are not enough approved reviews yet to say how customers rate ${companyName}.`
    },
    {
      question: `Where can I read ${companyName} reviews?`,
      answer: `You can read approved ${companyName} reviews on this Furniture Brand Reviews profile page.`
    },
    {
      question: `What do customers mention about ${companyName}?`,
      answer: themes
        ? themes.map((theme) => theme.text).join(" ")
        : "There are not enough detailed reviews yet to identify clear customer feedback patterns."
    },
    {
      question: `Can I write a review for ${companyName}?`,
      answer: `Yes. Customers can submit a review for ${companyName}. New reviews are moderated before publishing.`
    },
    {
      question: "Does Furniture Brand Reviews verify reviews?",
      answer:
        verifiedCount > 0
          ? `${verifiedCount} approved ${verifiedCount === 1 ? "review is" : "reviews are"} currently marked as verified. Reviews are moderated before publishing, but Furniture Brand Reviews does not claim every published review is verified.`
          : "Reviews are moderated before publishing. A review is only shown as verified when the database marks it as verified."
    }
  ];
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  if (!company) return { title: "Brand not found" };

  const title = `${company.name} Reviews | Furniture Brand Reviews`;
  const description = `Read ${company.name} reviews from furniture customers. See ratings, delivery feedback, product quality comments, complaints, and customer experiences before you buy.`;
  const canonical = `${baseUrl}/review/${company.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Furniture Brand Reviews",
      images: [{ url: company.cover_image_url ?? company.logo_url ?? company.og_image_url ?? "/logo.png", alt: title }],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [company.cover_image_url ?? company.logo_url ?? company.og_image_url ?? "/logo.png"]
    }
  };
}

export default async function CompanyReviewPage({ params }: Props) {
  const company = await getCompanyBySlug(params.slug);
  if (!company) notFound();

  const reviews = await getApprovedReviewsForCompany(company.id);
  const breakdown = getRatingBreakdown(reviews);
  const companies = await getCompanies();
  const similarBrands = companies.filter((item) => item.slug !== company.slug).slice(0, 4);
  const customerThemes = getCustomerThemes(reviews);
  const faqs = buildFaq(company.name, reviews);
  const canonical = `${baseUrl}/review/${company.slug}`;
  const aboutText =
    company.description || `${company.name} is listed on Furniture Brand Reviews as part of our UK furniture brand review directory.`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.website,
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: company.average_rating.toFixed(1),
            reviewCount: reviews.length
          }
        }
      : {})
  };

  const reviewSchema = reviews.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: reviews.slice(0, 10).map((review, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Review",
            name: review.title,
            reviewBody: review.content,
            datePublished: review.created_at,
            author: { "@type": "Person", name: review.reviewer_name },
            reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
            itemReviewed: { "@type": "Organization", name: company.name, url: company.website }
          }
        }))
      }
    : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer }
    }))
  };

  return (
    <div className="bg-white">
      <JsonLd data={organizationSchema} />
      {reviewSchema && <JsonLd data={reviewSchema} />}
      <JsonLd data={faqSchema} />

      <div className="border-b border-gray-200 bg-wash">
        <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 md:py-10 lg:px-10">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <CompanyLogo name={company.name} logoUrl={company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? company.website_screenshot_url} size="lg" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted ring-1 ring-line">Unclaimed</span>
                    <span className="rounded-full bg-wash px-3 py-1 text-xs font-bold text-trust-dark">{company.category}</span>
                  </div>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">{company.name}</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                    Customer reviews, ratings, delivery feedback and buying experiences for {company.name}.
                  </p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-trust-dark"
                    >
                      <Globe2 size={16} />
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>

              <div className="grid gap-4 rounded-xl border border-gray-200 bg-wash p-4 sm:min-w-72">
                <Rating value={company.average_rating} count={reviews.length} size="medium" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Link href={`/review/${company.slug}/write`} className="rounded-full bg-trust px-5 py-3 text-center font-bold text-white hover:bg-trust-dark">
                    Write a review
                  </Link>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 font-bold text-ink hover:border-trust hover:text-trust-dark"
                    >
                      Visit website <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
        <main className="grid gap-8">
          <ReviewSummaryWithFilters
            companyName={company.name}
            averageRating={company.average_rating}
            reviews={reviews}
            breakdown={breakdown}
            brandSlug={company.slug}
            writeReviewHref={`/review/${company.slug}/write`}
          />

          <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">About {company.name}</h2>
            <p className="leading-7 text-muted">{aboutText}</p>
          </section>

          <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">What customers mention about {company.name}</h2>
            {customerThemes ? (
              <div className="grid gap-3 md:grid-cols-2">
                {customerThemes.map((theme) => (
                  <div key={theme.label} className="rounded-xl bg-wash p-4">
                    <h3 className="font-bold text-ink">{theme.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{theme.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="leading-7 text-muted">There are not enough detailed reviews yet to identify clear customer feedback patterns.</p>
            )}
          </section>

          <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Is {company.name} legit?</h2>
            <p className="leading-7 text-muted">
              Furniture Brand Reviews provides customer-submitted reviews and brand information to help shoppers compare furniture companies. Always check the brand&apos;s official website, policies, delivery information and recent customer feedback before purchasing.
            </p>
          </section>

          <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">{company.name} delivery reviews</h2>
            <p className="leading-7 text-muted">{getDeliverySummary(company.name, reviews)}</p>
          </section>

          <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">{company.name} complaints</h2>
            <p className="leading-7 text-muted">{getComplaintsSummary(company.name, reviews)}</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Write a review for {company.name}</h2>
            <p className="mt-2 leading-7 text-muted">Share your furniture buying experience to help other shoppers compare delivery, quality and customer service.</p>
            <Link href={`/review/${company.slug}/write`} className="mt-5 inline-flex rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark">
              Write a review
            </Link>
          </section>
        </main>

        <aside className="grid h-fit gap-5 lg:sticky lg:top-6">
          {company.cover_image_url && (
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="aspect-video bg-wash bg-cover bg-center" style={{ backgroundImage: `url("${company.cover_image_url}")` }} aria-label={`${company.name} cover image`} />
            </section>
          )}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Company details</h2>
            <div className="mt-5 grid gap-5 text-sm">
              <div>
                <p className="font-bold text-ink">About this brand</p>
                <p className="mt-2 leading-6 text-muted">{aboutText}</p>
              </div>
              <div className="grid gap-3">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted hover:text-trust-dark">
                    <Globe2 size={16} />
                    Website
                  </a>
                )}
                <p className="flex items-center gap-2 text-muted">
                  <Mail size={16} />
                  Contact info not provided yet
                </p>
                <p className="flex items-center gap-2 text-muted">
                  <CheckCircle2 size={16} />
                  Unclaimed profile
                </p>
              </div>
              <div className="rounded-xl bg-wash p-4">
                <p className="font-bold text-ink">Review activity</p>
                <div className="mt-3 grid gap-3 text-muted">
                  <p className="flex items-center gap-2">
                    <MessageSquareReply size={16} />
                    Replied to negative reviews: Not enough data yet
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 size={16} />
                    Typical reply time: Not available yet
                  </p>
                </div>
              </div>
              <p className="rounded-full bg-wash px-4 py-2 text-center font-bold text-trust-dark">{company.category}</p>
              <a href={canonical} className="break-all text-xs text-muted hover:text-trust-dark">
                {canonical}
              </a>
            </div>
          </section>
        </aside>
      </div>

      <section className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-10">
        <div className="rounded-xl border border-gray-200 bg-wash p-6">
          <h2 className="text-2xl font-bold text-ink">FAQ</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-bold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-10">
        <h2 className="text-2xl font-bold text-ink">People also viewed</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {similarBrands.map((brand) => (
            <BrandCard key={brand.id} company={brand} />
          ))}
        </div>
      </section>
    </div>
  );
}
