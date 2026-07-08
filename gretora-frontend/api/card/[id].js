import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { id } = req.query;

  let recipientName = "You";
  let occasion = "Special Occasion";

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from("greetings")
      .select("occassion, receiptant_name")
      .eq("id", id)
      .single();

    if (data) {
      recipientName = data.receiptant_name || "You";
      occasion = data.occassion || "Special Occasion";
    }
  } catch (e) {}

  const title = `${occasion} Greeting for ${recipientName} \uD83C\uDF81`;
  const description = `Someone prepared a special ${occasion} video greeting card just for you. Tap to reveal the surprise!`;
  const ogImage = `https://www.gretora.com/api/og/${id}`;
  const watchUrl = `https://www.gretora.com/g/${id}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${watchUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta http-equiv="refresh" content="0;url=${watchUrl}" />
</head>
<body>
  <p>Opening your greeting card...</p>
  <script>window.location.href="${watchUrl}";</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).send(html);
}