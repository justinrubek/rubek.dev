import { visit } from "unist-util-visit";

export default function codeBlockData() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type == "html" && node.value.includes('class="astro-code"')) {
                // include the language as a data attribute
                let lang = node.lang ?? "";
                if (lang != "") {
                    lang = `data-lang="${lang}"`;
                }

                // include other key/value pairs as data attributes
                const data_attrs = String(node.meta).replace(/(\w+\=.*?)/g, "data-$1");

                const meta_string = `
                    ${lang} ${data_attrs}
                `;
                node.value = node.value.replace(
                    '"astro-code"',
                    (item) => `${item} ${meta_string}`
                );
            }
        });
    };
}
