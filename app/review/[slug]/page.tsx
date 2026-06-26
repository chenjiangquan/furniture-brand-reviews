import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock3, ExternalLink, Globe2, Mail, MessageSquareReply } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { BrandShareActions } from "@/components/BrandShareActions";
import { CompanyLogo } from "@/components/CompanyLogo";
import { JsonLd } from "@/components/JsonLd";
import { Rating } from "@/components/Rating";
import { ReviewIntelligence } from "@/components/ReviewIntelligence";
import { ReviewSummaryWithFilters } from "@/components/ReviewSummaryWithFilters";
import { getApprovedReviewStatsForCompany, getApprovedReviewsForCompany, getCompanies, getCompanyBySlug, getRatingBreakdownFromStats } from "@/lib/data";
import { getPublishedBlogs } from "@/lib/blogs";
import {
  buildBrandOrganizationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraph,
  buildReviewItemListSchema
} from "@/lib/jsonLd";
import { getRelatedBlogs, getRelatedBrands, getRelatedCategories, getRelatedComparisons, getRelatedRankingPages } from "@/lib/internal-links";
import { buildReviewIntelligence, getReviewsForIntelligence } from "@/lib/review-intelligence";
import { createNoIndexMetadata, siteUrl } from "@/lib/seo";
import type { ReviewWithReply } from "@/lib/types";

type Props = { params: { slug: string } };

const baseUrl = siteUrl;

const deliveryKeywords = ["delivery", "delivered", "shipping", "courier", "dispatch", "arrived", "late", "delay"];
const complaintKeywords = ["complaint", "problem", "issue", "damaged", "refund", "return", "late", "delay", "poor", "broken", "fault"];

function reviewText(review: ReviewWithReply) {
  return `${review.title} ${review.content}`.toLowerCase();
}

function countMentions(reviews: ReviewWithReply[], keywords: string[]) {
  return reviews.filter((review) => keywords.some((keyword) => reviewText(review).includes(keyword))).length;
}

function getCustomerThemes(reviews: ReviewWithReply[]) {
  const eligibleReviews = getReviewsForIntelligence(reviews);
  if (eligibleReviews.length < 3) return null;

  const themes = [
    { label: "Delivery experience", count: countMentions(eligibleReviews, deliveryKeywords) },
    { label: "Product quality", count: countMentions(eligibleReviews, ["quality", "solid", "comfortable", "material", "finish", "assembly"]) },
    { label: "Customer service", count: countMentions(eligibleReviews, ["service", "support", "reply", "help", "staff", "team"]) },
    { label: "Value for money", count: countMentions(eligibleReviews, ["value", "price", "expensive", "cheap", "cost", "money"]) },
    { label: "Returns or after-sales support", count: countMentions(eligibleReviews, ["return", "refund", "after-sales", "replacement", "warranty"]) }
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

function buildFaq(companyName: string, reviews: ReviewWithReply[], totalApprovedReviewCount: number) {
  const themes = getCustomerThemes(reviews);
  const verifiedCount = reviews.filter((review) => review.is_verified).length;

  return [
    {
      question: `Is ${companyName} a good furniture brand?`,
      answer:
        totalApprovedReviewCount > 0
          ? `${companyName} has ${totalApprovedReviewCount} approved customer ${totalApprovedReviewCount === 1 ? "review" : "reviews"} on Furniture Brand Reviews with an average rating based on currently published feedback.`
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  if (!company) return createNoIndexMetadata("Brand not found", "This furniture brand review page could not be found.");

  const title = `${company.name} Reviews | Customer Ratings, Delivery & Complaints`;
  const hasReviews = company.review_count > 0 && company.average_rating > 0;
  const description = hasReviews
    ? `Read ${company.review_count} ${company.name} reviews covering delivery, product quality, customer service and complaints. Average rating: ${company.average_rating.toFixed(1)}/5.`
    : `Read and write independent ${company.name} reviews. Compare furniture delivery, product quality, customer service and complaints.`;
  const canonical = `${baseUrl}/review/${company.slug}`;
  const image = company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? "/logo.png";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Furniture Brand Reviews",
      images: [{ url: image, alt: title }],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function CompanyReviewPage({ params }: Props) {
  const company = await getCompanyBySlug(params.slug);
  if (!company) notFound();

  const reviews = await getApprovedReviewsForCompany(company.id);
  const approvedReviewStats = await getApprovedReviewStatsForCompany(company.id);
  const totalApprovedReviewCount = approvedReviewStats.count || company.review_count;
  const averageApprovedRating = approvedReviewStats.count ? approvedReviewStats.averageRating : company.average_rating;
  const breakdown = getRatingBreakdownFromStats(
    approvedReviewStats.count
      ? approvedReviewStats
      : {
          count: company.review_count,
          averageRating: company.average_rating,
          ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
  );
  const companies = await getCompanies();
  const blogs = await getPublishedBlogs();
  const relatedBrands = getRelatedBrands(company, companies, 6);
  const relatedCategories = getRelatedCategories(company, 4);
  const relatedRankingPages = getRelatedRankingPages(company, 3);
  const relatedComparisons = getRelatedComparisons(company, relatedBrands, 4);
  const relatedBlogs = getRelatedBlogs(company, blogs, 3);
  const intelligenceSample = buildReviewIntelligence(reviews);
  const intelligence = {
    ...intelligenceSample,
    approvedReviewCount: totalApprovedReviewCount,
    averageRating: averageApprovedRating,
    starDistribution: breakdown.map((item) => ({
      rating: item.rating as 5 | 4 | 3 | 2 | 1,
      count: item.count,
      percentage: item.percentage
    })),
    hasEnoughForPatterns: totalApprovedReviewCount >= 3,
    hasEnoughForTopics: totalApprovedReviewCount >= 5,
    hasEnoughForSummaries: totalApprovedReviewCount >= 10
  };
  const customerThemes = getCustomerThemes(reviews);
  const faqs = buildFaq(company.name, reviews, totalApprovedReviewCount);
  const canonical = `${baseUrl}/review/${company.slug}`;
  const writeReviewUrl = `${baseUrl}/review/${company.slug}/write`;
  const aboutText =
    company.description || `${company.name} is listed on Furniture Brand Reviews as part of our UK furniture brand review directory.`;

  const brandOrganizationSchema = buildBrandOrganizationSchema(company);
  const reviewSchema = buildReviewItemListSchema(company, reviews, canonical);
  const faqSchema = buildFaqSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: `${baseUrl}/` },
    { name: "Furniture Brands", url: `${baseUrl}/brands` },
    { name: `${company.name} Reviews`, url: canonical }
  ]);

  return (
    <div className="bg-white">
      <JsonLd data={buildGraph([brandOrganizationSchema, reviewSchema, faqSchema, breadcrumbSchema])} />

      <div className="border-b border-gray-200 bg-wash">
        <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 md:py-10 lg:px-10">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <CompanyLogo name={company.name} logoUrl={company.logo_url ?? company.cover_image_url ?? company.og_image_url ?? company.website_screenshot_url} size="lg" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${company.is_claimed ? "bg-purple-50 text-trust-dark ring-purple-200" : "bg-white text-muted ring-line"}`}>
                      {company.is_claimed ? "✓ Claimed Business" : "Unclaimed"}
                    </span>
                    <span className="rounded-full bg-wash px-3 py-1 text-xs font-bold text-trust-dark">{company.category}</span>
                  </div>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">{company.name}</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                    Customer reviews, ratings, delivery feedback and buying experiences for {company.name}.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/review/${company.slug}/write`} className="rounded-full bg-trust px-5 py-3 text-sm font-bold text-white hover:bg-trust-dark">
                      Write a review
                    </Link>
                    <Link href={`/review/${company.slug}/write`} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-trust-dark hover:border-trust">
                      Share your experience
                    </Link>
                  </div>
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
                <Rating value={averageApprovedRating} count={totalApprovedReviewCount} size="medium" />
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
            averageRating={averageApprovedRating}
            reviews={reviews}
            totalReviewCount={totalApprovedReviewCount}
            loadedReviewCount={reviews.length}
            breakdown={breakdown}
            brandSlug={company.slug}
            writeReviewHref={`/review/${company.slug}/write`}
          />

          <ReviewIntelligence companyName={company.name} intelligence={intelligence} />

          <section className="rounded-xl border border-purple-100 bg-purple-50 p-6">
            <h2 className="text-2xl font-bold text-ink">Share your furniture buying experience</h2>
            <p className="mt-2 leading-7 text-muted">
              Have you bought from {company.name}? Share your review to help other furniture buyers compare delivery, product quality and customer service.
            </p>
            <Link href={`/review/${company.slug}/write`} className="mt-5 inline-flex rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark">
              Write a review for {company.name}
            </Link>
          </section>

          <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">About {company.name}</h2>
            <p className="leading-7 text-muted">{aboutText}</p>
          </section>

          <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Is {company.name} legit?</h2>
            <p className="leading-7 text-muted">
              Furniture Brand Reviews provides customer-submitted reviews and brand information to help shoppers compare furniture companies. Always check the brand&apos;s official website, policies, delivery information and recent customer feedback before purchasing.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Write a review for {company.name}</h2>
            <p className="mt-2 leading-7 text-muted">Share your furniture buying experience to help other shoppers compare delivery, quality and customer service.</p>
            <Link href={`/review/${company.slug}/write`} className="mt-5 inline-flex rounded-full bg-trust px-5 py-3 font-bold text-white hover:bg-trust-dark">
              Write a review
            </Link>
          </section>
          <BrandShareActions brandName={company.name} reviewPageUrl={canonical} writeReviewUrl={writeReviewUrl} />
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
                  {company.is_claimed ? "Claimed Business" : "Unclaimed profile"}
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
        {relatedComparisons.length > 0 ? (
          <div className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Compare with similar brands</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedComparisons.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full bg-wash px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {relatedCategories.length > 0 ? (
          <div className="mb-10 rounded-xl border border-gray-200 bg-wash p-6">
            <h2 className="text-2xl font-bold text-ink">Related furniture categories</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
                >
                  {category.label}
                </Link>
              ))}
              {relatedRankingPages.map((ranking) => (
                <Link
                  key={ranking.href}
                  href={ranking.href}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-trust-dark ring-1 ring-line hover:ring-trust"
                >
                  {ranking.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {relatedBlogs.length > 0 ? (
          <div className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Related buying guides</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedBlogs.map((blog) => (
                <Link key={blog.href} href={blog.href} className="rounded-xl border border-line bg-wash p-4 hover:border-trust">
                  <h3 className="font-bold leading-snug text-ink">{blog.label}</h3>
                  {blog.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{blog.description}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {relatedBrands.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-ink">Related furniture brands</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedBrands.map((brand) => (
                <BrandCard key={brand.id} company={brand} />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
