from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email    = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class ChecklistItemSerializer(serializers.Serializer):
    text    = serializers.CharField()
    checked = serializers.BooleanField(default=False)

class NoteSerializer(serializers.Serializer):
    id        = serializers.CharField(read_only=True)
    title     = serializers.CharField(max_length=200)
    content   = serializers.CharField(default='',allow_blank=True,required=False)
    is_pinned = serializers.BooleanField(default=False)
    is_checklist = serializers.BooleanField(default=False)
    items        = ChecklistItemSerializer(many=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)