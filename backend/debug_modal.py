import modal
try:
    print(f"modal.Mount exists: {modal.Mount}")
except AttributeError:
    print("modal.Mount does NOT exist")
    try:
        from modal import Mount
        print("from modal import Mount works")
    except ImportError:
        print("from modal import Mount failed")

print(f"Modal version: {getattr(modal, '__version__', 'unknown')}")
