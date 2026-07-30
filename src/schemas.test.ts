import { BlobRef, Lexicons, type LexiconDoc } from "@atproto/lexicon";
import { describe, expect, it } from "vitest";
import photograph from "../lexicons/social/opencontent/photograph.json" with { type: "json" };
import collection from "../lexicons/social/opencontent/collection.json" with { type: "json" };
import site from "../lexicons/social/opencontent/site.json" with { type: "json" };
import strongRef from "../lexicons/com/atproto/repo/strongRef.json" with { type: "json" };
import labelDefs from "../lexicons/com/atproto/label/defs.json" with { type: "json" };

// `@atproto/lexicon`'s Lexicons needs every referenced schema doc loaded
// locally to resolve `#ref`s and cross-NSID refs (com.atproto.repo.strongRef,
// com.atproto.label.defs#selfLabels) — hence the local copies in
// lexicons/com/atproto/. This is the minimal "does the commons parse and
// self-resolve" check; the full behavioral test suite lives in the
// openportfolio consumer repo.
const docs = [photograph, collection, site, strongRef, labelDefs] as LexiconDoc[];

describe("social.opencontent.* lexicon set", () => {
  it("loads all schema documents without throwing (valid lexicon syntax)", () => {
    expect(() => new Lexicons(docs)).not.toThrow();
  });

  it("self-resolves every $ref (no dangling references in the set)", () => {
    const lex = new Lexicons(docs);

    function image() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new BlobRef({ $link: "bafkreib3vqp" } as any, "image/jpeg", 12345);
    }

    expect(() =>
      lex.assertValidRecord("social.opencontent.photograph", {
        $type: "social.opencontent.photograph",
        image: image(),
        aspectRatio: { width: 4, height: 3 },
        createdAt: "2026-07-28T00:00:00.000Z",
        labels: { $type: "com.atproto.label.defs#selfLabels", values: [{ val: "nudity" }] },
      }),
    ).not.toThrow();

    expect(() =>
      lex.assertValidRecord("social.opencontent.collection", {
        $type: "social.opencontent.collection",
        title: "Shorebirds 2026",
        items: [
          {
            uri: "at://did:plc:abc/social.opencontent.photograph/3jxyzabc123",
            cid: "bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a",
          },
        ],
        createdAt: "2026-07-28T00:00:00.000Z",
      }),
    ).not.toThrow();

    expect(() =>
      lex.assertValidRecord("social.opencontent.site", {
        $type: "social.opencontent.site",
        title: "Kevin Lee Photography",
        collectionOrder: ["3jxyzabc123"],
        createdAt: "2026-07-28T00:00:00.000Z",
      }),
    ).not.toThrow();
  });

  it("rejects a record missing a required field (schemas actually enforce constraints)", () => {
    const lex = new Lexicons(docs);
    expect(() =>
      lex.assertValidRecord("social.opencontent.photograph", {
        $type: "social.opencontent.photograph",
        createdAt: "2026-07-28T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("declares a raster-only image accept list with no SVG (script-vector guard)", () => {
    const image = photograph.defs.main.record.properties.image as {
      accept: string[];
      maxSize: number;
    };
    expect(image.accept).not.toContain("image/svg+xml");
    expect(image.maxSize).toBe(20971520);
  });
});
