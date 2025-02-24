#!/usr/bin/env python
import sys
import types

# --- Monkey-patch for missing distutils ---
try:
    from distutils.version import LooseVersion
except ImportError:
    # If not available (as in Python 3.13), import from setuptools._distutils.version
    from setuptools._distutils.version import LooseVersion
    # Create a fake 'distutils' module with a 'version' submodule containing LooseVersion
    distutils_mod = types.ModuleType("distutils")
    version_mod = types.ModuleType("distutils.version")
    version_mod.LooseVersion = LooseVersion
    distutils_mod.version = version_mod
    sys.modules["distutils"] = distutils_mod
    sys.modules["distutils.version"] = version_mod
# --- End monkey-patch for distutils ---

import six
# Monkey-patch for django.utils.six
sys.modules["django.utils.six"] = six

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "macrosondemand.settings")
try:
    from django.core.management import execute_from_command_line
except ImportError as exc:
    raise ImportError(
        "Couldn't import Django. Are you sure it's installed and "
        "available on your PYTHONPATH environment variable? Did you "
        "forget to activate a virtual environment?"
    ) from exc
execute_from_command_line(sys.argv)


