---
layout: ../../layouts/MarkdownPostLayout.astro
title: "TIL: Allow PUT-as-create in DRF"
pubDate: "2023-07-31"
author: "MimmyJau"
description: "Understanding a custom mixin that lets PUT requests create new records"
tags: ["source code", "design patterns", "drf", "python",  "learning in public", "TIL"]
---

DRF doesn't allow PUT-as-create by default, which is in violation of the [HTTP RFC](https://stackoverflow.com/a/59171818). Luckily, there is a [`AllowPUTAsCreateMixin`](https://gist.github.com/tomchristie/a2ace4577eff2c603b1b) by Tom Christie (creator of DRF) to implement this behaviour. Here's the code:

``` python
class AllowPUTAsCreateMixin(object):
    """
    The following mixin class may be used in order to support PUT-as-create
    behavior for incoming requests.
    """
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object_or_none()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        if instance is None:
            lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
            lookup_value = self.kwargs[lookup_url_kwarg]
            extra_kwargs = {self.lookup_field: lookup_value}
            serializer.save(**extra_kwargs)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def get_object_or_none(self):
        try:
            return self.get_object()
        except Http404:
            if self.request.method == 'PUT':
                # For PUT-as-create operation, we need to ensure that we have
                # relevant permissions, as if this was a POST request.  This
                # will either raise a PermissionDenied exception, or simply
                # return None.
                self.check_permissions(clone_request(self.request, 'POST'))
            else:
                # PATCH requests where the object does not exist should still
                # return a 404 response.
                raise
```

It is perhaps worth taking some time to re-familiarize ourselves with how views, mixins, and serializers all fit together in DRF. 

Here's the code for the implementation of `UpdateAPIView`, `UpdateModelMixin` and `GenericAPIView`.

``` python
class UpdateAPIView(mixins.UpdateModelMixin, GenericAPIView):
    """
    Concrete view for updating a model instance.
    """

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
```

``` python
class UpdateModelMixin:
    """
    Update a model instance.
    """

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)
```

``` python
class GenericAPIView(views.APIView):
    """
    Base class for all other generic views.
    """

    # You'll need to either set these attributes,
    # or override `get_queryset()`/`get_serializer_class()`.
    # If you are overriding a view method, it is important that you call
    # `get_queryset()` instead of accessing the `queryset` property directly,
    # as `queryset` will get evaluated only once, and those results are cached
    # for all subsequent requests.
    queryset = None
    serializer_class = None

    # If you want to use object lookups other than pk, set 'lookup_field'.
    # For more complex lookup requirements override `get_object()`.
    lookup_field = "pk"
    lookup_url_kwarg = None

    # The filter backend classes to use for queryset filtering
    filter_backends = api_settings.DEFAULT_FILTER_BACKENDS

    # The style to use for queryset pagination.
    pagination_class = api_settings.DEFAULT_PAGINATION_CLASS

    def get_queryset(self):
        """
        Get the list of items for this view.
        This must be an iterable, and may be a queryset.
        Defaults to using `self.queryset`.

        This method should always be used rather than accessing `self.queryset`
        directly, as `self.queryset` gets evaluated only once, and those results
        are cached for all subsequent requests.

        You may want to override this if you need to provide different
        querysets depending on the incoming request.

        (Eg. return a list of items that is specific to the user)
        """
        assert self.queryset is not None, (
            "'%s' should either include a `queryset` attribute, "
            "or override the `get_queryset()` method." % self.__class__.__name__
        )

        queryset = self.queryset
        if isinstance(queryset, QuerySet):
            # Ensure queryset is re-evaluated on each request.
            queryset = queryset.all()
        return queryset

    def get_object(self):
        """
        Returns the object the view is displaying.

        You may want to override this if you need to provide non-standard
        queryset lookups.  Eg if objects are referenced using multiple
        keyword arguments in the url conf.
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
            "Expected view %s to be called with a URL keyword argument "
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            "attribute on the view correctly."
            % (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault("context", self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    def get_serializer_class(self):
        """
        Return the class to use for the serializer.
        Defaults to using `self.serializer_class`.

        You may want to override this if you need to provide different
        serializations depending on the incoming request.

        (Eg. admins get full serialization, others get basic serialization)
        """
        assert self.serializer_class is not None, (
            "'%s' should either include a `serializer_class` attribute, "
            "or override the `get_serializer_class()` method." % self.__class__.__name__
        )

        return self.serializer_class

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {"request": self.request, "format": self.format_kwarg, "view": self}

    def filter_queryset(self, queryset):
        """
        Given a queryset, filter it with whichever filter backend is in use.

        You are unlikely to want to override this method, although you may need
        to call it either from a list view, or from a custom `get_object`
        method if you want to apply the configured filtering backend to the
        default queryset.
        """
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset

    @property
    def paginator(self):
        """
        The paginator instance associated with the view, or `None`.
        """
        if not hasattr(self, "_paginator"):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator

    def paginate_queryset(self, queryset):
        """
        Return a single page of results, or `None` if pagination is disabled.
        """
        if self.paginator is None:
            return None
        return self.paginator.paginate_queryset(queryset, self.request, view=self)

    def get_paginated_response(self, data):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data)

```

This is a lot to take in, but let me highlight the most important things in each class.

`GenericAPIView` mainly does 4 things: 
- It figures out what the QuerySet is
- It uses the QuerySet to retrieve the data,
- It figures out what the serializer class is,
- It uses the serializer class to create an instance of the serializer with the retrieved data. 

The first two are combined in `.get_object()`, which calls `.get_queryset()` behind the scenes, and the last two are combined in `.get_serializer()`, which calls `.get_serializer_class()` behind the scenes.

While `GenericAPIView` organizes its methods by the information they contain (e.g. QuerySet, object, serializer class, serializer instance), `UpdateModelMixin`'s main purpose is to call these lower-level methods in a **temporal order**[^1] to actually accomplish the task of updating data. 

> It is worth noting that `.get_object()` and `.get_serializer()` are designed to be called, while `.get_queryset()` and `.get_serializer_class()` are designed to be overridden if we want custom behaviour. This is an important distinction in DRF and is known as the **Template Design Pattern**, with the former two being the **template methods** and the latter two being the **helper or hook methods**.

`UpdateModelMixin` mainly does 4 things:
- It gets the object,
- It converts the object into a serializer instance,
- It validates the data,
- It saves the data.

The first two are accomplished using methods from `GenericAPIView`, namely `.get_object()` and `.get_serializer()`, while the latter two are accomplished using methods from the `Serializer` class, namely `.is_valid()` and `.save()`.

Lastly, all `UpdateAPIView` does is decide whether the HTTP request is a PUT request, in which case it calls `.update()`, or a PATCH request, in which case it calls `.partial_update()`. Both are methods in `UpdateModelMixin`. 

---

Now back to interpreting `AllowPUTAsCreateMixin`. 

The main differences between the two is that in `AllowPUTAsCreateMixin`,
1) We define a `.get_object_or_none()` method that we use instead of `.get_object()` (which behind the scenes calls `.get_object_or_404()`), and
2) There is an `if instance is None:` code block.

Let's start with the first difference. The default behaviour of the detailed views (i.e. `Retrieve`, `Update`, `Destroy`) is to throw an `Http404` error if we cannot find a record of the object. If we're implementing PUT-as-create behaviour however, we instead want to *create* a new record if it doesn't already exist. There's a small conditional that confirms the request is indeed a PUT request (and not a PATCH request), and that the user has the correct permissions. If both are true, we ignore the error that otherwise would have been returned by `.get_object_or_404()`.

The second difference is what happens if `get_object_or_none()` returns `None`. The implementation here assumes we want to use the identifier in the url `lookup_url_kwargs` to populate some field in the record (i.e. the `lookup_field`). This is a reasonable assumption for most cases. For example, if we received a PUT request to `/api/product/123` and couldn't find it, we'd probably want to create some product with `{id: 123, name: "chair", ...}`. 

[^1]: Thanks to John Ousterhout for defining this concept in "Chapter 5: Information Hiding" of "A Philosophy of Software Design".
