from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_image(request):
    user = request.user
    profile_image = request.data.get("profile_image")

    if not profile_image:
        return Response({"error": "No profile image provided"}, status=400)

    user.profile_image = profile_image
    user.save()

    return Response({"profile_image": user.profile_image})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_image": user.profile_image,
    })
