from langchain_text_splitters import MarkdownHeaderTextSplitter

def parse_guidelines(filepath: str):
    """
    Reads a markdown file and splits it along markdown headers.
    Returns a list of LangChain Document objects.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    return markdown_splitter.split_text(content)
