import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AttachmentInput {
  filename: string;
  content: string;
  contentType: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const email = Deno.env.get('HOSTINGER_EMAIL');
    const password = Deno.env.get('HOSTINGER_EMAIL_PASSWORD');

    if (!email || !password) {
      throw new Error('Email credentials not configured');
    }

    const { to, subject, html, cc, bcc, replyTo, attachments } = await req.json();

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.hostinger.com",
        port: 465,
        tls: true,
        auth: {
          username: email,
          password: password,
        },
      },
    });

    // Build base config
    const toAddresses = Array.isArray(to) ? to : [to];
    
    // Handle attachments (base64 encoded)
    let attachmentsList: Array<{filename: string; content: Uint8Array; contentType: string; encoding: "binary"}> | undefined;
    if (attachments && attachments.length > 0) {
      attachmentsList = attachments.map((att: AttachmentInput) => ({
        filename: att.filename,
        content: Uint8Array.from(atob(att.content), c => c.charCodeAt(0)),
        contentType: att.contentType,
        encoding: "binary" as const,
      }));
    }

    await client.send({
      from: email,
      to: toAddresses,
      subject,
      html,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      replyTo: replyTo || undefined,
      attachments: attachmentsList,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
