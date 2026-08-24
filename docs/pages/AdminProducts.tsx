import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function AdminProducts() {
  const { fe, be } = useDocs();
  const isNode = be === 'node';
  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Admin"
          title="Products CRUD"
          description="Full back-office: create, edit, delete + cover/gallery upload to S3. Sales role degrades the same screen to read-only via field-level RBAC. 1:1 port of the MUI flavor."
        />

        <H2>The form</H2>
        <P>
          Create and Edit share a single <code>AdminProductFormBody</code>{' '}
          component. The difference is the submit function (POST vs PATCH)
          and the navigate-after-success (Create → land on Edit so images
          can be uploaded; Edit → reset form to saved values).
        </P>
        <P>
          A shared <code>ACCESS</code> constant is passed as the{' '}
          <code>access</code> prop to every field. A sales user loading
          the page sees the same JSX — but inputs render as read-only
          because <code>products:update</code> is admin-only.
        </P>
        <CodeBlock
          filename="client/tailwind/src/features/admin/products/AdminProductFormBody.tsx"
          language="tsx"
          code={`const ACCESS = {
  resource: 'products',
  action: 'update',
  onUnauthorized: 'readonly',
} as const;

<InputField name="name" label="Name" access={ACCESS} />
<InputField name="slug" label="Slug" access={ACCESS} />
<InputField name="price" label="Price (cents)" type="number" access={ACCESS} />`}
        />

        <H2>Image upload to S3</H2>
        <P>
          Cover + gallery upload share one <code>ProductImagesPanel</code>.
          Drag-and-drop overlay on both surfaces — drop a file → 10 MB
          cap → MIME whitelist (png / jpg / webp) → S3 upload → URL
          persisted on the product. Each upload/remove button is wrapped
          in <code>{'<Can products:update />'}</code> — sales role sees
          only the image previews, never the controls.
        </P>
        <CodeBlock
          filename="client/tailwind/src/features/admin/products/ProductImagesPanel.tsx"
          language="tsx"
          code={`<Can resource="products" action="update">
  <button onClick={() => coverInputRef.current?.click()}>
    Upload cover
  </button>
</Can>`}
        />

        {isNode ? (
          <CodeBlock
            filename="server/src/controllers/admin-product.controller.ts"
            language="typescript"
            code={`const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MiB

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
};`}
          />
        ) : (
          <CodeBlock
            filename="server/internal/handler/admin_product.go"
            language="go"
            code={`const maxImageSize = 10 * 1024 * 1024  // 10 MiB

func canonicalImageExt(contentType string) (string, error) {
    switch contentType {
    case "image/jpeg": return "jpg", nil
    case "image/png":  return "png", nil
    case "image/webp": return "webp", nil
    default:
        return "", fmt.Errorf("unsupported image type %q", contentType)
    }
}`}
          />
        )}

        <Callout variant="warning" title="Orphan caveat">
          If the S3 upload succeeds but the subsequent DB persist fails,
          the uploaded file remains in S3 unreferenced. V1 ships without
          an orphan janitor — a periodic job that lists{' '}
          <code>products/</code> and removes keys with no DB reference
          is the documented next step.
        </Callout>

        <Callout variant="tip" title="Sales is read-only by policy, not by code">
          The page has zero <code>if (role === 'admin')</code> branches.
          Locking inputs for sales happens entirely through the policy +
          the <code>access</code> prop. To grant sales{' '}
          <code>products:update</code> in your fork, edit{' '}
          <code>{isNode ? 'src/seed-data/policies.json' : 'seed/policies.json'}</code>{' '}
          — no component code changes.
        </Callout>
      </>
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="Admin"
        title="Products CRUD"
        description="Full back-office: create, edit, delete + cover/gallery upload to S3. Sales role degrades the same screen to read-only via field-level RBAC."
      />

      <H2>The form</H2>
      <P>
        The admin product form is shared between Create and Edit. The
        difference is the submit function (POST vs PATCH) and the
        navigate-after-success (Create → land on Edit so images
        can be uploaded; Edit → reset form to the saved values).
      </P>
      <P>
        Every field carries an <code>access</code> prop. A sales user
        loading the page sees the same JSX — but inputs render as
        read-only with a lock icon because{' '}
        <code>products:update</code> is admin-only.
      </P>
      <CodeBlock
        filename="form fields"
        language="tsx"
        code={`<InputField name="name" label="Name"
  access={{
    resource: 'products',
    action: 'update',
    onUnauthorized: 'readonly',
  }}
/>

<InputField name="price" label="Price (cents)" type="number"
  access={{ resource: 'products', action: 'update', onUnauthorized: 'readonly' }}
/>`}
      />

      <H2>Image upload to S3</H2>
      <P>
        Cover + gallery upload share one panel. Drag-and-drop overlay
        on both surfaces — drop a file → 10 MB cap → MIME whitelist
        (png / jpg / webp) → S3 upload → URL persisted on the product.
        Sales role hides the upload + remove buttons entirely (gated by{' '}
        <code>&lt;Can products:update /&gt;</code> wrappers).
      </P>

      {isNode ? (
        <CodeBlock
          filename="server/src/controllers/admin-product.controller.ts"
          language="typescript"
          code={`const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MiB

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
};

function canonicalImageExt(contentType: string): string {
  const ext = ALLOWED_IMAGE_TYPES[contentType];
  if (!ext) {
    throw new AppError(
      'VALIDATION_ERROR',
      \`unsupported image type "\${contentType}" (allowed: image/jpeg, png, webp)\`,
      422,
    );
  }
  return ext;
}

// Storage key: products/<productID>/images/<newObjectID>.<ext>
// Hard-deleting a product makes "products/<id>/" a single recursive S3
// delete (a future janitor sweeps orphans).
function productImageKey(productId: string, ext: string): string {
  return \`products/\${productId}/images/\${new mongoose.Types.ObjectId().toHexString()}.\${ext}\`;
}`}
        />
      ) : (
        <CodeBlock
          filename="server/internal/handler/admin_product.go"
          language="go"
          code={`const maxImageSize = 10 * 1024 * 1024  // 10 MiB

func canonicalImageExt(contentType string) (string, error) {
    switch contentType {
    case "image/jpeg": return "jpg", nil
    case "image/png":  return "png", nil
    case "image/webp": return "webp", nil
    default:
        return "", fmt.Errorf(
          "unsupported image type %q (allowed: image/jpeg, png, webp)", contentType,
        )
    }
}

// Storage key: products/<productID>/images/<newObjectID>.<ext>
// Hard-deleting a product makes "products/<id>/" a single recursive S3
// delete (a future janitor sweeps orphans).
func productImageKey(productID bson.ObjectID, ext string) string {
    return fmt.Sprintf(
      "products/%s/images/%s.%s",
      productID.Hex(),
      bson.NewObjectID().Hex(),
      ext,
    )
}`}
        />
      )}

      <Callout variant="warning" title="Orphan caveat">
        If the S3 upload succeeds but the subsequent DB persist fails
        (e.g. the product was deleted mid-flow), the uploaded file
        remains in S3 unreferenced. V1 ships without an orphan janitor
        — a periodic job that lists{' '}<code>products/</code> and removes
        keys with no DB reference is the documented next step.
      </Callout>

      <Callout variant="tip" title="Sales is read-only by policy, not by code">
        The page has zero <code>if (role === 'admin')</code> branches.
        Locking inputs for sales happens entirely through the policy +
        the <code>access</code> prop. To grant sales{' '}
        <code>products:update</code> in your fork, you edit{' '}
        <code>{isNode ? 'src/seed-data/policies.json' : 'seed/policies.json'}</code>{' '}
        — no component code changes.
      </Callout>
    </>
  );
}
